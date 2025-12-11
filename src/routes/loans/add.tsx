import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { loansCollection } from '../../collections/loans'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

export const Route = createFileRoute('/loans/add')({
  component: RouteComponent,
})

interface AddLoanFormData {
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
  const navigate = useNavigate()
  const [formData, setFormData] = useState<AddLoanFormData>({
    name: '',
    type: 'mortgage',
    interestRate: '',
  })

  const handleInputChange = (field: keyof AddLoanFormData, value: string) => {
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
    
    if (!formData.name || !formData.interestRate) return

    const interestRate = parseFloat(formData.interestRate)
    if (isNaN(interestRate)) return

    let newLoan: any = {
      id: crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      interestRate,
    }

    if (formData.type === 'credit_card') {
      const balance = parseFloat(formData.balance || '0')
      const minimumPayment = parseFloat(formData.minimumPayment || '0')
      
      if (isNaN(balance) || isNaN(minimumPayment)) return

      newLoan = {
        ...newLoan,
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

      newLoan = {
        ...newLoan,
        principal,
        termYears,
        monthlyPayment,
        remainingBalance,
      }
    }

    await loansCollection.insert(newLoan)
    navigate({ to: '/loans' })
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
        <h1 className="text-3xl font-bold text-gray-900">Add New Loan</h1>
        <p className="text-gray-600 mt-1">
          Add a mortgage, personal loan, or credit card debt
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
                    placeholder="Leave empty to use original amount"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty if this is a new loan
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
                    placeholder="Leave empty to calculate automatically"
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
              <Button type="submit" className="flex-1">Add Loan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}