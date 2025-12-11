import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { Plus, Home, TrendingUp, PiggyBank, Edit3 } from 'lucide-react'
import { assetsCollection } from '../../collections/assets'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export const Route = createFileRoute('/assets/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: assets } = useLiveQuery(assetsCollection)
  const navigate = useNavigate()


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
        
        <Button onClick={() => navigate({ to: '/assets/add' })}>
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {assets && assets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset: any) => (
            <Card key={asset.id} className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <div className="flex items-center space-x-2">
                  {asset.type === 'house' ? (
                    <Home className="h-4 w-4 text-blue-600" />
                  ) : asset.type === 'stocks' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <PiggyBank className="h-4 w-4 text-purple-600" />
                  )}
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {asset.type === 'house' ? 'House' : asset.type === 'stocks' ? 'Stocks' : 'Savings Account'}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/assets/$assetId/edit', params: { assetId: asset.id } })}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
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
                {asset.type === 'savings' && 'interestRate' in asset && (
                  <p className="text-xs text-purple-600 mt-1">
                    Interest Rate: {asset.interestRate}%
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
