import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { incomeCollection } from '../../collections/income'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useLiveQuery } from '@tanstack/react-db'
import { assetsCollection } from '@/collections/assets'

export const Route = createFileRoute('/income/add')({
  component: RouteComponent,
})

interface AddIncomeFormData {
  name: string
  type: 'salary'
  amount: string
  period?: 'monthly'
  targetAssetId?: string
}

function RouteComponent() {
  const navigate = useNavigate()
  const { data: assets } = useLiveQuery(assetsCollection)
  const [formData, setFormData] = useState<AddIncomeFormData>({
    name: '',
    type: 'salary',
    amount: '',
    period: 'monthly'
  })

  const handleInputChange = (field: keyof AddIncomeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()


    if (formData.targetAssetId == null) {
      return;
    }

    await incomeCollection.insert({
      id: crypto.randomUUID(),
      amount: parseFloat(formData.amount),
      name: formData.name,
      period: 'monthly',
      targetAssetId: formData.targetAssetId,
    })
    navigate({ to: '/income' })
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate({ to: '/income' })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Income
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Income</h1>
        <p className="text-gray-600 mt-1">
          Add a new income source to your financial plan
        </p>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-xl text-gray-900">Income Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Income Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter income source name"
                className="mt-2"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Income Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'salary' | 'subsidies') => handleInputChange('type', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="subsidies">Subsidies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                onValueChange={(value) => handleInputChange('targetAssetId', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assets?.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount">
                Amount ($) - {formData.type === 'salary' ? 'Monthly' : 'Annual'}
              </Label>
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
              <p className="text-sm text-gray-500 mt-1">
                {formData.type === 'salary' 
                  ? 'Enter your monthly salary amount' 
                  : 'Enter your annual subsidies amount'
                }
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate({ to: '/income' })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Add Income</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}