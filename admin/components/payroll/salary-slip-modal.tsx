"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, Building2, CheckCircle, Clock } from "lucide-react"

export function SalarySlipModal({
  open,
  onOpenChange,
  payroll,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  payroll: any
}) {
  if (!payroll) return null

  const emp = payroll.employee || {}
  const basic = Number(payroll.basicSalary) || 0
  const bonus = Number(payroll.bonus) || 0
  const deductions = Number(payroll.deductions) || 0
  const net = Number(payroll.netSalary) || basic + bonus - deductions
  const isPaid = payroll.status === "Paid"

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex justify-between items-center text-lg">
            <span>Salary Payslip</span>
            <Button size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print Payslip
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="printable-payslip" className="p-6 border rounded-xl bg-background space-y-6 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xl">
                <Building2 className="h-6 w-6 text-emerald-600" />
                <span>City Care Hospital & Research Center</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Main Boulevard, Gulberg III, Lahore, Pakistan &bull; Ph: +92 42 35789000
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPaid ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}>
                {isPaid ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {payroll.status || "Pending"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Ref: #PAY-{payroll.id}
              </p>
            </div>
          </div>

          {/* Employee Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
            <div>
              <p className="text-xs text-muted-foreground">Employee Name</p>
              <p className="font-semibold text-foreground">{emp.name || `Employee #${payroll.employeeId}`}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Designation / Role</p>
              <p className="font-semibold text-foreground">{emp.designation || emp.type || "Staff Member"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pay Period</p>
              <p className="font-semibold text-foreground">{payroll.month || "Current Month"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment Date</p>
              <p className="font-semibold text-foreground">
                {payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString("en-PK") : "Pending Payout"}
              </p>
            </div>
            {emp.cnic && (
              <div>
                <p className="text-xs text-muted-foreground">CNIC Number</p>
                <p className="font-medium text-foreground">{emp.cnic}</p>
              </div>
            )}
            {emp.phone && (
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{emp.phone}</p>
              </div>
            )}
          </div>

          {/* Salary Breakdown Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground font-semibold text-xs border-b">
                <tr>
                  <th className="py-2.5 px-4 text-left">EARNINGS / DEDUCTIONS</th>
                  <th className="py-2.5 px-4 text-right">AMOUNT (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-4">Basic Salary</td>
                  <td className="py-2 px-4 text-right font-medium">₨ {basic.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-emerald-600 font-medium">+ Bonus / Allowances</td>
                  <td className="py-2 px-4 text-right font-medium text-emerald-600">₨ {bonus.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-destructive font-medium">- Deductions / Tax</td>
                  <td className="py-2 px-4 text-right font-medium text-destructive">₨ {deductions.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="bg-muted/50 border-t font-bold">
                <tr>
                  <td className="py-3 px-4 text-base">NET TAKE-HOME SALARY</td>
                  <td className="py-3 px-4 text-right text-base text-emerald-700">₨ {net.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center border-t mt-6">
            <div>
              <div className="border-b w-3/4 mx-auto mb-1"></div>
              <p className="font-medium text-muted-foreground">Employee Signature</p>
            </div>
            <div>
              <div className="border-b w-3/4 mx-auto mb-1"></div>
              <p className="font-medium text-muted-foreground">HR Manager / Accounts Officer</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
