import type { VercelRequest, VercelResponse } from "@vercel/node";

interface OrderData {
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    instructions?: string;
  };
  items: Array<{
    id: string;
    name: string;
    qty: number;
    price: number;
    discount?: number;
  }>;
  subtotal: number;
  total: number;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data: OrderData = req.body;

    if (!data.customer || !data.items || data.items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const orderId = `JFF-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const itemsBlock = data.items
      .map((i) => {
        const eff = i.discount ? i.price * (1 - i.discount / 100) : i.price;
        return `• ${i.name} × ${i.qty} — Rs ${Math.round(eff * i.qty).toLocaleString()}`;
      })
      .join("\n");

    const emailBody = [
      `NEW ORDER — ${orderId}`,
      `Time: ${timestamp}`,
      ``,
      `Customer: ${data.customer.name}`,
      `Phone: ${data.customer.phone}`,
      `Email: ${data.customer.email}`,
      `Address: ${data.customer.address}, ${data.customer.city}`,
      data.customer.instructions ? `Notes: ${data.customer.instructions}` : ``,
      ``,
      `Items:`,
      itemsBlock,
      ``,
      `Subtotal: Rs ${Math.round(data.subtotal).toLocaleString()}`,
      `Total: Rs ${Math.round(data.total).toLocaleString()}`,
      `Payment: Cash on Delivery`,
      `Status: Pending confirmation`,
    ]
      .filter(Boolean)
      .join("\n");

    const resendKey = process.env.RESEND_API_KEY;
    const companyEmail = process.env.COMPANY_EMAIL || "orders@jansfrozenfood.com";

    if (resendKey) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "JAN'S Frozen Food <onboarding@resend.dev>",
          to: [companyEmail],
          subject: `New Order ${orderId} — ${data.customer.name}`,
          text: emailBody,
        }),
      }).catch((e) => console.error("Email send failed:", e));
    } else {
      console.log("[ORDER]", emailBody);
    }

    return res.status(200).json({
      ok: true,
      orderId,
      timestamp,
    });
  } catch (error) {
    console.error("Order error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Failed to process order",
      message,
    });
  }
}
