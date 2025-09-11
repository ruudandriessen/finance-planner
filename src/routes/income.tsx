import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { useState } from 'react'
import { Plus, DollarSign, Gift } from 'lucide-react'
import { incomeCollection } from '../collections/income'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export const Route = createFileRoute('/income')({
  component: RouteComponent,
})

interface AddIncomeFormData {
  name: string
  type: 'salary' | 'subsidies'
  amount: string
  period?: 'monthly'
}

function RouteComponent() {
  const { data: income } = useLiveQuery(incomeCollection)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
    
    if (!formData.name || !formData.amount) return

    const amount = parseFloat(formData.amount)
    if (isNaN(amount)) return

    const newIncome = {
      id: crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      amount,
      ...(formData.type === 'salary' && formData.period 
        ? { period: formData.period } 
        : {})
    }

    await incomeCollection.insert(newIncome)
    
    setFormData({ name: '', type: 'salary', amount: '', period: 'monthly' })
    setIsDialogOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateTotalMonthlyIncome = () => {
    if (!income) return 0
    return income.reduce((sum: number, incomeItem) => {
      if (incomeItem.type === 'salary') {
        return sum + incomeItem.amount
      } else {
        return sum + (incomeItem.amount / 12)
      }
    }, 0)
  }

  const totalMonthlyIncome = calculateTotalMonthlyIncome()
  const totalAnnualIncome = totalMonthlyIncome * 12

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income</h1>
          <p className="text-gray-600 mt-1">
            Monthly: {formatCurrency(totalMonthlyIncome)} • Annual: {formatCurrency(totalAnnualIncome)}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Income</DialogTitle>
              <DialogDescription>
                Add a new income source to your financial plan.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Income Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter income source name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Income Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'salary' | 'subsidies') => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="subsidies">Subsidies</SelectItem>
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
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Income</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {income && income.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {income.map((incomeItem: any) => (
            <Card key={incomeItem.id} className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2 p-4">
                <div className="flex items-center space-x-2">
                  {incomeItem.type === 'salary' ? (
                    <DollarSign className="h-4 w-4 text-green-600" />
                  ) : (
                    <Gift className="h-4 w-4 text-blue-600" />
                  )}
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {incomeItem.type === 'salary' ? 'Salary' : 'Subsidies'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(incomeItem.amount)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {incomeItem.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {incomeItem.type === 'salary' ? 'Monthly' : 'Annual'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-gray-200 rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-gray-600 text-center">
              <p className="text-lg font-medium mb-2 text-gray-900">No income sources yet</p>
              <p className="text-sm text-gray-600">Add your first income source to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}