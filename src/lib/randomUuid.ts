// crypto.randomUUID() só existe em HTTPS ou localhost; pelo IP da rede (teste no celular) ele não existe.
// crypto.getRandomValues() existe em qualquer página.
export function randomUuid(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // versão 4 (aleatório)
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante padrão (RFC 9562)

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
}
