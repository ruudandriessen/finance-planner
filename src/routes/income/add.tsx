import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { incomeCollection } from '../../collections/income'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { IncomeForm } from '../../components/income/IncomeForm'

export const Route = createFileRoute('/income/add')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const handleSubmit = async (data: { name: string; amount: string; targetAssetId?: string; period?: 'monthly' }) => {
    if (data.targetAssetId == null) {
      return
    }

    await incomeCollection.insert({
      id: crypto.randomUUID(),
      amount: parseFloat(data.amount),
      name: data.name,
      period: 'monthly',
      targetAssetId: data.targetAssetId,
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
          <IncomeForm
            mode="add"
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: '/income' })}
          />
        </CardContent>
      </Card>
    </div>
  )
}