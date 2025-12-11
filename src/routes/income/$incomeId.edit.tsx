import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { incomeCollection } from '../../collections/income'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { assetsCollection } from '@/collections/assets'

export const Route = createFileRoute('/income/$incomeId/edit')({
  component: RouteComponent,
})

interface EditIncomeFormData {
  name: string
  amount: number;
  targetAssetId?: string;
  period?: 'monthly'
}

function RouteComponent() {
  const { incomeId } = Route.useParams()
  const navigate = useNavigate()
  const { data: assets } = useLiveQuery(assetsCollection)
  const { data: income } = useLiveQuery(incomeCollection)
  
  const incomeItem = income?.find(i => i.id === incomeId)
  if (!incomeItem) return <div>Income not found</div>

  const [formData, setFormData] = useState<EditIncomeFormData>(incomeItem)

  const handleInputChange = (field: keyof EditIncomeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await incomeCollection.update(incomeItem.id, (oldIncome) => {
      oldIncome.name = formData.name
      oldIncome.amount = formData.amount
      if (formData.period)  {
        oldIncome.period = formData.period
      }
    })
    navigate({ to: '/income' })
  }

  const handleDelete = async () => {
    if (!incomeItem) return
    
    if (confirm(`Are you sure you want to delete "${incomeItem.name}"?`)) {
      await incomeCollection.delete(incomeItem.id)
      navigate({ to: '/income' })
    }
  }

  if (!incomeItem) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Income source not found</p>
          <Button 
            onClick={() => navigate({ to: '/income' })}
            className="mt-4"
          >
            Back to Income
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
          onClick={() => navigate({ to: '/income' })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Income
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Income</h1>
        <p className="text-gray-600 mt-1">
          Update your income source details
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
              <Label htmlFor="asset">Asset</Label>
              <Select
                onValueChange={(value) => handleInputChange('targetAssetId', value)}
              >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent id="asset">
                {assets?.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            
            <div>
              <Label htmlFor="amount">
                Amount ($) - Monthly
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
                Enter your monthly amount you receive
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
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                className="flex-1"
              >
                Delete
              </Button>
              <Button type="submit" className="flex-1">Update Income</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}