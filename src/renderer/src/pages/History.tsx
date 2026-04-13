import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { format } from 'date-fns'

export default function HistoryPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['fullHistory'],
    queryFn: () => api.getStockHistory(500)
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transaction History</h2>
        <p className="text-muted-foreground mt-1">Log of all stock movements.</p>
      </div>

      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[150px]">Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Loading history...
                    </TableCell>
                  </TableRow>
                ) : history?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  history?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">
                        {format(new Date(record.created_at + 'Z'), 'dd MMM yyyy, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            record.type === 'stock_in'
                              ? 'border-emerald-500 text-emerald-500'
                              : 'border-rose-500 text-rose-500'
                          }
                        >
                          {record.type === 'stock_in' ? 'Stock In' : 'Stock Out'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{record.product_name}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {record.product_barcode}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold ${record.type === 'stock_in' ? 'text-emerald-500' : 'text-rose-500'}`}
                      >
                        {record.type === 'stock_in' ? '+' : '-'}
                        {record.change_qty}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {record.reason || '-'}
                      </TableCell>
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
