import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { loansCollection } from '../../collections/loans'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

export const Route = createFileRoute('/loans/$loanId/edit')({
  component: RouteComponent,
})

interface EditLoanFormData {
  name: string
  type: 'mortgage' | 'personal' | 'credit_card'
  principal?: string
  balance?: string
  interestRate: string
  termYears?: string
  monthlyPayment?: string
  minimumPayment?: string
  remainingBalance?: string
}

function RouteComponent() {
  const { loanId } = Route.useParams()
  const navigate = useNavigate()
  const { data: loans } = useLiveQuery(loansCollection)
  
  const [formData, setFormData] = useState<EditLoanFormData>({
    name: '',
    type: 'mortgage',
    interestRate: '',
  })

  const loan = loans?.find(l => l.id === loanId)

  useEffect(() => {
    if (loan) {
      if (loan.type === 'credit_card') {
        setFormData({
          name: loan.name,
          type: loan.type,
          balance: loan.balance.toString(),
          interestRate: loan.interestRate.toString(),
          minimumPayment: loan.minimumPayment.toString(),
        })
      } else {
        setFormData({
          name: loan.name,
          type: loan.type,
          principal: loan.principal.toString(),
          interestRate: loan.interestRate.toString(),
          termYears: loan.termYears.toString(),
          monthlyPayment: loan.monthlyPayment.toString(),
          remainingBalance: loan.remainingBalance.toString(),
        })
      }
    }
  }, [loan])

  const handleInputChange = (field: keyof EditLoanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
    const monthlyRate = annualRate / 100 / 12
    const numPayments = years * 12
    
    if (monthlyRate === 0) return principal / numPayments
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.interestRate || !loan) return

    const interestRate = parseFloat(formData.interestRate)
    if (isNaN(interestRate)) return

    let updatedLoan: any = {
      id: loan.id,
      name: formData.name,
      type: formData.type,
      interestRate,
    }

    if (formData.type === 'credit_card') {
      const balance = parseFloat(formData.balance || '0')
      const minimumPayment = parseFloat(formData.minimumPayment || '0')
      
      if (isNaN(balance) || isNaN(minimumPayment)) return

      updatedLoan = {
        ...updatedLoan,
        balance,
        minimumPayment,
      }
    } else {
      // mortgage or personal loan
      const principal = parseFloat(formData.principal || '0')
      const termYears = parseFloat(formData.termYears || '0')
      
      if (isNaN(principal) || isNaN(termYears)) return

      const monthlyPayment = formData.monthlyPayment 
        ? parseFloat(formData.monthlyPayment)
        : calculateMonthlyPayment(principal, interestRate, termYears)
      
      const remainingBalance = parseFloat(formData.remainingBalance || principal.toString())

      updatedLoan = {
        ...updatedLoan,
        principal,
        termYears,
        monthlyPayment,
        remainingBalance,
      }
    }

    await loansCollection.update(loan.id, updatedLoan)
    navigate({ to: '/loans' })
  }

  const handleDelete = async () => {
    if (!loan) return
    
    if (confirm(`Are you sure you want to delete "${loan.name}"?`)) {
      await loansCollection.delete(loan.id)
      navigate({ to: '/loans' })
    }
  }

  if (!loan) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loan not found</p>
          <Button 
            onClick={() => navigate({ to: '/loans' })}
            className="mt-4"
          >
            Back to Loans
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
          onClick={() => navigate({ to: '/loans' })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Loans
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Loan</h1>
        <p className="text-gray-600 mt-1">
          Update your loan details
        </p>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-xl text-gray-900">Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Loan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter loan name"
                className="mt-2"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Loan Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'mortgage' | 'personal' | 'credit_card') => handleInputChange('type', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mortgage">Mortgage</SelectItem>
                  <SelectItem value="personal">Personal Loan</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="Enter annual interest rate"
                className="mt-2"
                required
              />
            </div>

            {formData.type === 'credit_card' ? (
              <>
                <div>
                  <Label htmlFor="balance">Current Balance ($)</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.balance || ''}
                    onChange={(e) => handleInputChange('balance', e.target.value)}
                    placeholder="Enter current balance"
                    className="mt-2"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="minimumPayment">Minimum Payment ($)</Label>
                  <Input
                    id="minimumPayment"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumPayment || ''}
                    onChange={(e) => handleInputChange('minimumPayment', e.target.value)}
                    placeholder="Enter minimum monthly payment"
                    className="mt-2"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="principal">Original Loan Amount ($)</Label>
                  <Input
                    id="principal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.principal || ''}
                    onChange={(e) => handleInputChange('principal', e.target.value)}
                    placeholder="Enter original loan amount"
                    className="mt-2"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="termYears">Loan Term (Years)</Label>
                  <Input
                    id="termYears"
                    type="number"
                    min="1"
                    value={formData.termYears || ''}
                    onChange={(e) => handleInputChange('termYears', e.target.value)}
                    placeholder="Enter loan term in years"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="remainingBalance">Remaining Balance ($)</Label>
                  <Input
                    id="remainingBalance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.remainingBalance || ''}
                    onChange={(e) => handleInputChange('remainingBalance', e.target.value)}
                    placeholder="Enter remaining balance"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current amount still owed on the loan
                  </p>
                </div>

                <div>
                  <Label htmlFor="monthlyPayment">Monthly Payment ($)</Label>
                  <Input
                    id="monthlyPayment"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyPayment || ''}
                    onChange={(e) => handleInputChange('monthlyPayment', e.target.value)}
                    placeholder="Enter monthly payment"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to automatically calculate based on loan details
                  </p>
                </div>
              </>
            )}
            
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate({ to: '/loans' })}
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
              <Button type="submit" className="flex-1">Update Loan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}