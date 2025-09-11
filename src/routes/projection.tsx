import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { assetsCollection } from '../collections/assets'
import { incomeCollection } from '../collections/income'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export const Route = createFileRoute('/projection')({
  component: RouteComponent,
})

interface ProjectionData {
  year: number
  assets: number
  totalIncome: number
  netWorth: number
}

function RouteComponent() {
  const { data: assets } = useLiveQuery(assetsCollection)
  const { data: income } = useLiveQuery(incomeCollection)
  const [yearsToProject, setYearsToProject] = useState(30)
  const [savingsRate, setSavingsRate] = useState(20) // percentage
  const [inflationRate, setInflationRate] = useState(2.5) // percentage
  const [houseAppreciation, setHouseAppreciation] = useState(3) // percentage

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateProjection = (): ProjectionData[] => {
    if (!assets || !income) return []

    // Calculate initial values
    let currentAssets = assets.reduce((sum, asset) => sum + asset.amount, 0)
    
    const annualIncome = income.reduce((sum, incomeItem) => {
      if (incomeItem.type === 'salary') {
        return sum + (incomeItem.amount * 12)
      } else {
        return sum + incomeItem.amount
      }
    }, 0)

    const annualSavings = (annualIncome * savingsRate) / 100

    // Separate house and stock assets
    let houseValue = assets
      .filter(asset => asset.type === 'house')
      .reduce((sum, asset) => sum + asset.amount, 0)
    
    let stockValue = assets
      .filter(asset => asset.type === 'stocks')
      .reduce((sum, asset) => sum + asset.amount, 0)

    // Calculate average stock return rate
    const stockAssets = assets.filter(asset => asset.type === 'stocks')
    const avgStockReturn = stockAssets.length > 0 
      ? stockAssets.reduce((sum, asset) => sum + (asset.expectedReturn || 7), 0) / stockAssets.length
      : 7 // default 7% if no stocks

    const projectionData: ProjectionData[] = []
    let currentYear = new Date().getFullYear()
    let adjustedIncome = annualIncome
    let adjustedSavings = annualSavings

    // Add current year as starting point
    projectionData.push({
      year: currentYear,
      assets: currentAssets,
      totalIncome: adjustedIncome,
      netWorth: currentAssets
    })

    for (let i = 1; i <= yearsToProject; i++) {
      // Adjust for inflation
      adjustedIncome = adjustedIncome * (1 + inflationRate / 100)
      adjustedSavings = (adjustedIncome * savingsRate) / 100

      // Appreciate existing house value
      houseValue = houseValue * (1 + houseAppreciation / 100)

      // Grow existing stocks
      stockValue = stockValue * (1 + avgStockReturn / 100)

      // Add new savings (assume split between stocks and savings based on existing portfolio)
      const stockPortion = currentAssets > 0 ? stockValue / (houseValue + stockValue) : 0.7
      const newStockInvestment = adjustedSavings * stockPortion
      stockValue += newStockInvestment * (1 + avgStockReturn / 100)

      const totalAssets = houseValue + stockValue
      
      projectionData.push({
        year: currentYear + i,
        assets: totalAssets,
        totalIncome: adjustedIncome,
        netWorth: totalAssets
      })

      currentAssets = totalAssets
    }

    return projectionData
  }

  const projectionData = calculateProjection()

  const currentYear = new Date().getFullYear()
  const finalYear = currentYear + yearsToProject
  const finalNetWorth = projectionData[projectionData.length - 1]?.netWorth || 0

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Projection</h1>
        <p className="text-gray-600 mt-1">
          30-year projection based on your current assets and income
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-gray-700">Projection Period</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Label htmlFor="years">Years</Label>
            <Input
              id="years"
              type="number"
              min="1"
              max="50"
              value={yearsToProject}
              onChange={(e) => setYearsToProject(e.target.value === '' ? 30 : parseInt(e.target.value))}
              className="mt-1"
            />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-gray-700">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Label htmlFor="savings">Percentage (%)</Label>
            <Input
              id="savings"
              type="number"
              min="0"
              max="100"
              value={savingsRate}
              onChange={(e) => setSavingsRate(e.target.value === '' ? 20 : parseFloat(e.target.value))}
              className="mt-1"
            />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-gray-700">Inflation Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Label htmlFor="inflation">Percentage (%)</Label>
            <Input
              id="inflation"
              type="number"
              step="0.1"
              max="20"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value === '' ? 2.5 : parseFloat(e.target.value))}
              className="mt-1"
            />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-gray-700">House Appreciation</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Label htmlFor="house">Percentage (%)</Label>
            <Input
              id="house"
              type="number"
              step="0.1"
              max="20"
              value={houseAppreciation}
              onChange={(e) => setHouseAppreciation(e.target.value === '' ? 3 : parseFloat(e.target.value))}
              className="mt-1"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="p-4">
            <CardTitle className="text-lg text-gray-900">Current Net Worth</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(projectionData[0]?.netWorth || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="p-4">
            <CardTitle className="text-lg text-gray-900">Projected Net Worth ({finalYear})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(finalNetWorth)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="p-4">
            <CardTitle className="text-lg text-gray-900">Total Growth</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(finalNetWorth - (projectionData[0]?.netWorth || 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="p-4">
          <CardTitle className="text-xl text-gray-900">Net Worth Projection</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelFormatter={(year) => `Year: ${year}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="netWorth" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  name="Net Worth"
                />
                <Line 
                  type="monotone" 
                  dataKey="totalIncome" 
                  stroke="#059669" 
                  strokeWidth={2}
                  name="Annual Income"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {projectionData.length === 0 && (
        <Card className="mt-8 border border-gray-200 rounded-lg shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-gray-600 text-center">
              <p className="text-lg font-medium mb-2 text-gray-900">No data to project</p>
              <p className="text-sm text-gray-600">Add some assets and income sources to see your financial projection</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}