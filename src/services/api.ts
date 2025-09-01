import { AnimalIdentificationResponse } from "@/types";
import { API_ENDPOINTS, API_TIMEOUTS } from "@/utils/constants";
import { retry, createError, createTimeoutSignal } from "@/utils/helpers";

class AnimalAPI {
  private static instance: AnimalAPI;

  private constructor() {}

  public static getInstance(): AnimalAPI {
    if (!AnimalAPI.instance) {
      AnimalAPI.instance = new AnimalAPI();
    }
    return AnimalAPI.instance;
  }

  /**
   * Identyfikuje zwierzę na podstawie zdjęcia
   */
  // eslint-disable-next-line class-methods-use-this
  async identifyAnimal(
    imageUri: string
  ): Promise<AnimalIdentificationResponse> {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "animal.jpg",
      } as any);

      console.log("Sending request to:", API_ENDPOINTS.IDENTIFY_ANIMAL);
      console.log("FormData content:", formData);

      const response = await retry(
        async () => {
          const result = await fetch(API_ENDPOINTS.IDENTIFY_ANIMAL, {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
            signal: createTimeoutSignal(API_TIMEOUTS.upload),
          });

          console.log("Response status:", result.status);
          console.log("Response headers:", result.headers);

          if (!result.ok) {
            const errorText = await result.text();
            console.log("Error response body:", errorText);
            throw new Error(
              `HTTP error! status: ${result.status}, body: ${errorText}`
            );
          }

          return result;
        },
        3,
        2000
      );

      const data = await response.json();
      console.log("Response data:", data);

      // Sprawdź czy odpowiedź ma strukturę z polem 'output'
      const animalData = data.output || data;

      if (!animalData.name || !animalData.description) {
        throw createError(
          "INVALID_RESPONSE",
          "Nieprawidłowa odpowiedź z serwera - brak nazwy lub opisu zwierzęcia"
        );
      }

      return {
        name: animalData.name.trim(),
        description: animalData.description.trim(),
      };
    } catch (error) {
      console.error("Error identifying animal:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw createError(
            "TIMEOUT",
            "Przekroczono limit czasu połączenia. Sprawdź połączenie z internetem."
          );
        }

        if (error.message.includes("HTTP error")) {
          throw createError(
            "API_ERROR",
            "Błąd serwera podczas identyfikacji zwierzęcia. Spróbuj ponownie."
          );
        }
      }

      throw createError(
        "IDENTIFICATION_FAILED",
        "Nie udało się zidentyfikować zwierzęcia. Sprawdź jakość zdjęcia i spróbuj ponownie."
      );
    }
  }

  /**
   * Generuje odznakę dla zidentyfikowanego zwierzęcia
   */
  // eslint-disable-next-line class-methods-use-this
  async generateBadge(
    animalName: string
  ): Promise<{ imageData: ArrayBuffer; additionalData?: any }> {
    try {
      console.log("🎨 Generowanie odznaki dla zwierzęcia:", animalName);
      const encodedName = encodeURIComponent(animalName);
      const url = `${API_ENDPOINTS.GENERATE_BADGE}?name=${encodedName}`;
      console.log("🌐 URL generowania odznaki:", url);

      const response = await retry(
        async () => {
          const result = await fetch(url, {
            method: "GET",
            signal: createTimeoutSignal(API_TIMEOUTS.request),
          });

          if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`);
          }

          return result;
        },
        3,
        1000
      );

      // Sprawdź czy odpowiedź to JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        console.log("Badge generation response:", jsonResponse);

        // Obsługa struktury Google Gemini API
        let base64Data = null;

        // Sprawdź czy to tablica (nowa struktura)
        const responseData = Array.isArray(jsonResponse)
          ? jsonResponse[0]
          : jsonResponse;

        if (responseData.data) {
          // Stara struktura - bezpośrednio pole data
          base64Data = responseData.data;
        } else if (responseData.candidates?.[0]?.content?.parts) {
          // Nowa struktura Google Gemini API
          const { parts } = responseData.candidates[0].content;

          // Znajdź część z inlineData (obraz)
          const partWithImage = parts.find(
            (part: any) => part.inlineData?.data
          );
          if (partWithImage?.inlineData?.data) {
            base64Data = partWithImage.inlineData.data;
          }
        }

        if (base64Data) {
          console.log(
            "✅ Znaleziono dane obrazu, długość base64:",
            base64Data.length
          );

          try {
            // Konwertuj base64 data na ArrayBuffer
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            console.log(
              "✅ Obraz przekonwertowany, rozmiar:",
              bytes.buffer.byteLength,
              "bajtów"
            );

            return {
              imageData: bytes.buffer,
              additionalData: responseData,
            };
          } catch (conversionError) {
            console.error(
              "❌ Błąd konwersji base64 na ArrayBuffer:",
              conversionError
            );

            // Fallback: spróbuj użyć Buffer
            try {
              const buffer = Buffer.from(base64Data, "base64");
              const arrayBuffer = buffer.buffer.slice(
                buffer.byteOffset,
                buffer.byteOffset + buffer.byteLength
              );

              console.log(
                "✅ Obraz przekonwertowany (fallback), rozmiar:",
                arrayBuffer.byteLength,
                "bajtów"
              );

              return {
                imageData: arrayBuffer,
                additionalData: responseData,
              };
            } catch (fallbackError) {
              console.error("❌ Błąd fallback konwersji:", fallbackError);
              throw createError(
                "CONVERSION_ERROR",
                "Nie udało się przekonwertować danych obrazu"
              );
            }
          }
        } else {
          console.error(
            "❌ Nie znaleziono danych obrazu w odpowiedzi:",
            responseData
          );
          throw createError(
            "INVALID_RESPONSE",
            "Nieprawidłowa odpowiedź z serwera - brak danych obrazu"
          );
        }
      } else {
        // Fallback dla bezpośredniego ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength === 0) {
          throw createError(
            "EMPTY_RESPONSE",
            "Otrzymano pustą odpowiedź z serwera generowania odznaki"
          );
        }

        return { imageData: arrayBuffer };
      }
    } catch (error) {
      console.error("Error generating badge:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw createError(
            "TIMEOUT",
            "Przekroczono limit czasu podczas generowania odznaki"
          );
        }

        if (error.message.includes("HTTP error")) {
          throw createError(
            "API_ERROR",
            "Błąd serwera podczas generowania odznaki"
          );
        }
      }

      throw createError(
        "BADGE_GENERATION_FAILED",
        "Nie udało się wygenerować odznaki. Spróbuj ponownie."
      );
    }
  }

  /**
   * Sprawdza połączenie z serwerem
   */
  // eslint-disable-next-line class-methods-use-this
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(API_ENDPOINTS.IDENTIFY_ANIMAL, {
        method: "HEAD",
        signal: createTimeoutSignal(5000),
      });

      return response.ok;
    } catch (error) {
      console.error("Connection check failed:", error);
      return false;
    }
  }
}

export default AnimalAPI.getInstance();
