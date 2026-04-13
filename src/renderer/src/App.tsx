import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Barcode, Package2, History, Settings } from 'lucide-react'
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './components/ui/sidebar'
import { Toaster } from './components/ui/sonner'

// Pages
import Dashboard from './pages/Dashboard'
import BarcodeScanner from './pages/BarcodeScanner'
import Products from './pages/Products'
import HistoryPage from './pages/History'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Scanner", url: "/barcode", icon: Barcode },
    { title: "Products", url: "/products", icon: Package2 },
    { title: "History", url: "/history", icon: History },
  ]

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <SidebarProvider>
        <Sidebar className="border-r border-border/50">
          <SidebarContent>
            <div className="p-4 flex items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <Settings size={20} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent">39-YanYon</h1>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === item.url}
                        onClick={() => navigate(item.url)}
                        className="cursor-pointer"
                      >
                        <a>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/barcode" element={<BarcodeScanner />} />
            <Route path="/products" element={<Products />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </SidebarProvider>
      <Toaster theme="dark" />
    </div>
  )
}
