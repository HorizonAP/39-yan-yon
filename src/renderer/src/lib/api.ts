// HTTP API client — calls 39-yan-yon-api over the network
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const API_KEY  = import.meta.env.VITE_API_KEY  ?? ''

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key':    API_KEY,
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any)?.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  getProducts:         ()                                                   => req<any[]>('/products'),
  getProductByBarcode: (barcode: string)                                    => req<any>(`/products/barcode/${encodeURIComponent(barcode)}`),
  addProduct:          (product: any)                                       => req<any>('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct:       (id: number, product: any)                           => req<any>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(product) }),
  stockIn:             (productId: number, qty: number, reason?: string)    => req<any>(`/products/${productId}/stock-in`,  { method: 'POST', body: JSON.stringify({ qty, reason }) }),
  stockOut:            (productId: number, qty: number, reason?: string)    => req<any>(`/products/${productId}/stock-out`, { method: 'POST', body: JSON.stringify({ qty, reason }) }),
  getLowStockProducts: ()                                                   => req<any[]>('/products/low-stock'),
  getStockHistory:     (limit = 100)                                        => req<any[]>(`/history?limit=${limit}`),
  getDashboardStats:   ()                                                   => req<any>('/dashboard/stats'),
}
