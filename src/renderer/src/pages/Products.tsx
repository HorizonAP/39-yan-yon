import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'

export default function Products() {
  const [search, setSearch] = useState('')
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts()
  })

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground mt-1">Manage your inventory catalog.</p>
        </div>
        <Button className="bg-primary/90 hover:bg-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardHeader className="py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or barcode..."
              className="pl-9 bg-background/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">Barcode</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading products...</TableCell></TableRow>
                ) : filteredProducts?.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No products found.</TableCell></TableRow>
                ) : (
                  filteredProducts?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.barcode}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{p.brand || '-'}</TableCell>
                      <TableCell className="text-right text-muted-foreground">฿{p.cost_price}</TableCell>
                      <TableCell className="text-right">฿{p.sell_price}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={p.quantity <= p.min_stock ? "destructive" : "secondary"}>
                          {p.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{p.location || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
