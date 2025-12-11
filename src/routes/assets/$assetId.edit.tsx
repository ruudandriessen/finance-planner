import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { assetsCollection } from '../../collections/assets'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

export const Route = createFileRoute('/assets/$assetId/edit')({
  component: RouteComponent,
})

interface EditAssetFormData {
  name: string
  type: 'house' | 'stocks' | 'savings'
  amount: string
  expectedReturn?: string
  interestRate?: string
}

function RouteComponent() {
  const { assetId } = Route.useParams()
  const navigate = useNavigate()
  const { data: assets } = useLiveQuery(assetsCollection)
  
  const [formData, setFormData] = useState<EditAssetFormData>({
    name: '',
    type: 'house',
    amount: '',
    expectedReturn: '',
    interestRate: ''
  })

  const asset = assets?.find(a => a.id === assetId)

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        type: asset.type,
        amount: asset.amount.toString(),
        expectedReturn: asset.type === 'stocks' ? asset.expectedReturn?.toString() || '' : '',
        interestRate: asset.type === 'savings' ? asset.interestRate?.toString() || '' : ''
      })
    }
  }, [asset])

  const handleInputChange = (field: keyof EditAssetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.amount || !asset) return

    const amount = parseFloat(formData.amount)
    if (isNaN(amount)) return

    await assetsCollection.update(asset.id, (oldAsset) => {
      oldAsset.name = formData.name
      oldAsset.type = formData.type
      oldAsset.amount = parseFloat(formData.amount);
      if (oldAsset.type === 'stocks' && formData.type === 'stocks' && formData.expectedReturn)  {
        oldAsset.expectedReturn = parseFloat(formData.expectedReturn) ?? 0;
      }
      if (oldAsset.type === 'savings' && formData.type === 'savings' && formData.interestRate)  {
        oldAsset.interestRate = parseFloat(formData.interestRate) ?? 0;
      }
    })
    navigate({ to: '/assets' })
  }

  const handleDelete = async () => {
    if (!asset) return
    
    if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      await assetsCollection.delete(asset.id)
      navigate({ to: '/assets' })
    }
  }

  if (!asset) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Asset not found</p>
          <Button 
            onClick={() => navigate({ to: '/assets' })}
            className="mt-4"
          >
            Back to Assets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate({ to: '/assets' })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assets
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Asset</h1>
        <p className="text-gray-600 mt-1">
          Update your asset details
        </p>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-xl text-gray-900">Asset Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter asset name"
                className="mt-2"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Asset Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'house' | 'stocks' | 'savings') => handleInputChange('type', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                  <SelectItem value="savings">Savings Account</SelectItem>
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
                className="mt-2"
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
                  className="mt-2"
                />
              </div>
            )}
            
            {formData.type === 'savings' && (
              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  placeholder="Enter annual interest rate"
                  className="mt-2"
                />
              </div>
            )}
            
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate({ to: '/assets' })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                className="flex-1"
              >
                Delete
              </Button>
              <Button type="submit" className="flex-1">Update Asset</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}