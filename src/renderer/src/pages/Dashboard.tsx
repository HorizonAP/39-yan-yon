import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Package, DollarSign, AlertTriangle, Activity } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'
import { format } from 'date-fns'

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.getDashboardStats()
  })

  const { data: lowStock, isLoading: lowStockLoading } = useQuery({
    queryKey: ['lowStock'],
    queryFn: () => api.getLowStockProducts()
  })

  const { data: recentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['recentHistory'],
    queryFn: () => api.getStockHistory(10)
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your inventory status and recent activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '-' : stats?.totalProducts || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{statsLoading ? '-' : (stats?.totalStockValue || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '-' : stats?.lowStockCount || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
            <Activity className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '-' : stats?.todayTransactions || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Items at or below their minimum stock threshold.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Min</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                  ) : lowStock?.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">All stocks are healthy! 🎉</TableCell></TableRow>
                  ) : (
                    lowStock?.map((item: any) => (
                      <TableRow key={item.id} className="group transition-colors hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">{item.barcode}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={item.quantity === 0 ? "destructive" : "secondary"} className={item.quantity > 0 ? "bg-amber-500/20 text-amber-500" : ""}>
                            {item.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.min_stock}</TableCell>
                        <TableCell className="text-right">
                           <a href="#/barcode" className="text-xs text-primary hover:underline">Restock</a>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest stock movements.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {historyLoading ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
                ) : recentHistory?.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">No recent activity.</div>
                ) : (
                  recentHistory?.map((record: any) => (
                    <div key={record.id} className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${record.type === 'stock_in' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                        {record.type === 'stock_in' ? <Package className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{record.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.reason || (record.type === 'stock_in' ? 'Restocked' : 'Dispensed')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${record.type === 'stock_in' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {record.type === 'stock_in' ? '+' : '-'}{record.change_qty}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(record.created_at + 'Z'), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
