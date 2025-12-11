import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { assetsCollection } from '../../collections/assets'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export const Route = createFileRoute('/assets/add')({
  component: RouteComponent,
})

interface AddAssetFormData {
  name: string
  amount: string
}

function RouteComponent() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<AddAssetFormData>({
    name: '',
    amount: '',
  })

  const handleInputChange = (field: keyof AddAssetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (isNaN(amount)) return


    await assetsCollection.insert({
      id: crypto.randomUUID(),
      name: formData.name,
      amount,
    });
    navigate({ to: '/assets' })
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
        <h1 className="text-3xl font-bold text-gray-900">Add New Asset</h1>
        <p className="text-gray-600 mt-1">
          Add a new asset to your portfolio
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
            
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate({ to: '/assets' })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Add Asset</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}