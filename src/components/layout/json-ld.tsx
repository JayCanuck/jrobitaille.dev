import { serializeJsonLd } from '@/lib/json-ld';

interface JsonLdProps {
  data: object;
}

// Structured data is not executable code, so a native <script> is the right element (Next JSON-LD guide).
// The payload is serialized with "<" escaped; see serializeJsonLd.
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
