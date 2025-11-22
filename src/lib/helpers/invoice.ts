import dbConnect from "../mongodb";
import Order, { IOrder } from "../models/Order";

/**
 * Generate unique invoice number with format: PS-{Location}-{Sequential}
 * @param country - Country code from shipping address (e.g., "Indonesia" -> "ID", "Singapore" -> "SG")
 * @returns Promise<string> - Generated invoice number (e.g., "PS-ID-00001")
 */
export async function generateInvoiceNumber(country: string): Promise<string> {
  try {
    await dbConnect();

    // Map country names to location codes
    const locationMap: Record<string, string> = {
      indonesia: "ID",
      singapore: "SG",
      malaysia: "MY",
      thailand: "TH",
      philippines: "PH",
      vietnam: "VN",
      "hong kong": "HK",
      china: "CN",
      japan: "JP",
      "south korea": "KR",
      australia: "AU",
      "new zealand": "NZ",
      "united states": "US",
      "united kingdom": "UK",
      canada: "CA",
      // Add more countries as needed
    };

    // Get location code from country name
    const normalizedCountry = country.toLowerCase().trim();
    const locationCode = locationMap[normalizedCountry] || "XX"; // Default to "XX" if country not found

    // Find the latest invoice number for this location
    const latestOrder = (await Order.findOne({
      invoiceNumber: { $regex: `^PS-${locationCode}-` },
    })
      .sort({ invoiceNumber: -1 })
      .select("invoiceNumber")
      .lean()) as Pick<IOrder, "invoiceNumber"> | null;

    let nextSequence = 1;

    if (latestOrder && latestOrder.invoiceNumber) {
      // Extract sequence number from invoice (e.g., "PS-ID-00123" -> 123)
      const match = latestOrder.invoiceNumber.match(/PS-[A-Z]{2}-(\d+)$/);
      if (match && match[1]) {
        nextSequence = parseInt(match[1], 10) + 1;
      }
    }

    // Format sequence with leading zeros (5 digits)
    const sequenceStr = nextSequence.toString().padStart(5, "0");

    // Generate invoice number
    const invoiceNumber = `PS-${locationCode}-${sequenceStr}`;

    return invoiceNumber;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    throw new Error("Failed to generate invoice number");
  }
}

/**
 * Validate invoice number format
 * @param invoiceNumber - Invoice number to validate
 * @returns boolean - True if valid format
 */
export function validateInvoiceFormat(invoiceNumber: string): boolean {
  const pattern = /^PS-[A-Z]{2}-\d{5}$/;
  return pattern.test(invoiceNumber);
}

/**
 * Parse invoice number to extract components
 * @param invoiceNumber - Invoice number to parse
 * @returns Object with prefix, location, and sequence
 */
export function parseInvoiceNumber(invoiceNumber: string): {
  prefix: string;
  location: string;
  sequence: number;
} | null {
  const match = invoiceNumber.match(/^(PS)-([A-Z]{2})-(\d{5})$/);

  if (!match) {
    return null;
  }

  return {
    prefix: match[1],
    location: match[2],
    sequence: parseInt(match[3], 10),
  };
}
