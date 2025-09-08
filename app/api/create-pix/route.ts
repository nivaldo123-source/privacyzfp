import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const secretKey = "sk_live_h51FpTWTodvZ0dqVAqZV4R71Vu9qHFgDFCs95IGP4kaVauos"
    const companyId = "01ba2fe3-61f0-4da7-b019-297b044fc2c8"
    const authString = Buffer.from(`${secretKey}:${companyId}`).toString("base64")

    console.log("[API] Iniciando requisição PIX para AllowPay...")

    const transactionData = {
      customer: {
        name: body.customer?.name || "Cliente Teste",
        email: body.customer?.email || "cliente@teste.com",
        phone: body.customer?.phone || "11999999999",
        document: body.customer?.document || "11144477735",
      },
      shipping: {
        street: "Rua Teste",
        streetNumber: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01000000",
        complement: "",
      },
      paymentMethod: "PIX",
      pix: {
        expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      },
      items: [
        {
          title: body.description || "Assinatura Privacy",
          unitPrice: body.amount || 990,
          quantity: 1,
          externalRef: `item_${Date.now()}`,
        },
      ],
      amount: body.amount || 990,
      description: body.description || "Pagamento Privacy",
      postbackUrl: body.postbackUrl || null,
      metadata: body.metadata || null,
    }

    console.log("[API] Dados da transação:", JSON.stringify(transactionData, null, 2))

    const response = await fetch("https://api.allowpay.online/functions/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
        Accept: "application/json",
      },
      body: JSON.stringify(transactionData),
    })

    console.log(`[API] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`[API] Erro ${response.status}:`, errorText)
      return NextResponse.json(
        {
          error: `Erro da API AllowPay: ${response.status} - ${errorText}`,
        },
        { status: response.status },
      )
    }

    const result = await response.json()
    console.log("[API] Sucesso:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Erro geral:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
