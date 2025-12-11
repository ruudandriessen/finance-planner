import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { Plus, Home, CreditCard, User, Edit3 } from 'lucide-react'
import { loansCollection } from '../../collections/loans'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export const Route = createFileRoute('/loans/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: loans } = useLiveQuery(loansCollection)
  const navigate = useNavigate()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateTotalMonthlyPayments = () => {
    if (!loans) return 0
    return loans.reduce((sum: number, loan) => {
      if (loan.type === 'credit_card') {
        return sum + loan.minimumPayment
      } else {
        return sum + loan.monthlyPayment
      }
    }, 0)
  }

  const calculateTotalDebt = () => {
    if (!loans) return 0
    return loans.reduce((sum: number, loan) => {
      if (loan.type === 'credit_card') {
        return sum + loan.balance
      } else {
        return sum + loan.remainingBalance
      }
    }, 0)
  }

  const totalMonthlyPayments = calculateTotalMonthlyPayments()
  const totalDebt = calculateTotalDebt()

  const getLoanIcon = (type: string) => {
    switch (type) {
      case 'mortgage':
        return <Home className="h-4 w-4 text-blue-600" />
      case 'personal':
        return <User className="h-4 w-4 text-purple-600" />
      case 'credit_card':
        return <CreditCard className="h-4 w-4 text-red-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getLoanTypeLabel = (type: string) => {
    switch (type) {
      case 'mortgage':
        return 'Mortgage'
      case 'personal':
        return 'Personal Loan'
      case 'credit_card':
        return 'Credit Card'
      default:
        return type
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loans & Debt</h1>
          <p className="text-gray-600 mt-1">
            Total Debt: {formatCurrency(totalDebt)} • Monthly Payments: {formatCurrency(totalMonthlyPayments)}
          </p>
        </div>
        
        <Button onClick={() => navigate({ to: '/loans/add' })}>
          <Plus className="h-4 w-4" />
          Add Loan
        </Button>
      </div>

      {loans && loans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan: any) => (
            <Card key={loan.id} className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <div className="flex items-center space-x-2">
                  {getLoanIcon(loan.type)}
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {getLoanTypeLabel(loan.type)}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/loans/$loanId/edit', params: { loanId: loan.id } })}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-red-600">
                  -{formatCurrency(loan.type === 'credit_card' ? loan.balance : loan.remainingBalance)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {loan.name}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    Interest Rate: {loan.interestRate}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Monthly Payment: {formatCurrency(loan.type === 'credit_card' ? loan.minimumPayment : loan.monthlyPayment)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-gray-200 rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-gray-600 text-center">
              <p className="text-lg font-medium mb-2 text-gray-900">No loans yet</p>
              <p className="text-sm text-gray-600">Add your first loan or debt to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}