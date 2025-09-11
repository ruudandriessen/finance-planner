import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { useState } from 'react'
import { Plus, Home, TrendingUp } from 'lucide-react'
import { assetsCollection } from '../collections/assets'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export const Route = createFileRoute('/assets')({
  component: RouteComponent,
})

interface AddAssetFormData {
  name: string
  type: 'house' | 'stocks'
  amount: string
  expectedReturn?: string
}

function RouteComponent() {
  const { data: assets } = useLiveQuery(assetsCollection)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<AddAssetFormData>({
    name: '',
    type: 'house',
    amount: '',
    expectedReturn: ''
  })

  const handleInputChange = (field: keyof AddAssetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.amount) return

    const amount = parseFloat(formData.amount)
    if (isNaN(amount)) return

    const newAsset = {
      id: crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      amount,
      ...(formData.type === 'stocks' && formData.expectedReturn 
        ? { expectedReturn: parseFloat(formData.expectedReturn) || 0 } 
        : {})
    }

    await assetsCollection.insert(newAsset)
    
    setFormData({ name: '', type: 'house', amount: '', expectedReturn: '' })
    setIsDialogOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const totalValue = assets?.reduce((sum: number, asset) => sum + asset.amount, 0) || 0

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600 mt-1">
            Total Value: {formatCurrency(totalValue)}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>
                Add a new asset to your portfolio.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter asset name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Asset Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'house' | 'stocks') => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="stocks">Stocks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>
              
              {formData.type === 'stocks' && (
                <div>
                  <Label htmlFor="expectedReturn">Expected Return (%)</Label>
                  <Input
                    id="expectedReturn"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.expectedReturn}
                    onChange={(e) => handleInputChange('expectedReturn', e.target.value)}
                    placeholder="Enter expected return percentage"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Asset</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {assets && assets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset: any) => (
            <Card key={asset.id} className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2 p-4">
                <div className="flex items-center space-x-2">
                  {asset.type === 'house' ? (
                    <Home className="h-4 w-4 text-blue-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {asset.type === 'house' ? 'House' : 'Stocks'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(asset.amount)}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {asset.name}
                </p>
                {asset.type === 'stocks' && 'expectedReturn' in asset && (
                  <p className="text-xs text-green-600 mt-1">
                    Expected Return: {asset.expectedReturn}%
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-gray-200 rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-gray-600 text-center">
              <p className="text-lg font-medium mb-2 text-gray-900">No assets yet</p>
              <p className="text-sm text-gray-600">Add your first asset to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
