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

  // Generate a random ref number if none exists or use ID
  const refNo = `PAY-${new Date().getFullYear()}-${String(payroll.id).padStart(4, '0')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="print:hidden p-4 border-b bg-muted/20">
          <DialogTitle className="flex justify-between items-center text-lg">
            <span>Official Salary Payslip</span>
            <Button size="sm" onClick={handlePrint} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Printer className="h-4 w-4" /> Print Payslip
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Area */}
        <div id="printable-payslip" className="p-8 bg-white font-sans text-black">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black/10 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-2xl tracking-tight">
                <Building2 className="h-8 w-8 text-emerald-600" />
                <span>Medicare Core Hospital</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Main Boulevard, Gulberg III, Lahore, Pakistan<br/>
                Ph: +92 42 35789000 &bull; Email: hr@medicarecore.com
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold tracking-widest uppercase border-2 ${
                isPaid ? "border-emerald-600 text-emerald-700 bg-emerald-50" : "border-amber-500 text-amber-600 bg-amber-50"
              }`}>
                {isPaid ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                {isPaid ? "PAID OUT" : "PENDING"}
              </span>
              <p className="text-sm text-gray-500 mt-2 font-mono">
                Ref: {refNo}
              </p>
            </div>
          </div>

          <h2 className="text-center font-bold text-xl uppercase tracking-widest text-gray-800 mb-6">
            Salary Slip &bull; {payroll.month || "Current Month"}
          </h2>

          {/* Employee Info Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8">
            <div className="border-b border-dashed border-gray-300 pb-2 flex justify-between">
              <span className="text-gray-500 font-medium">Employee Name:</span>
              <span className="font-bold text-gray-900">{emp.name || `Employee #${payroll.employeeId}`}</span>
            </div>
            <div className="border-b border-dashed border-gray-300 pb-2 flex justify-between">
              <span className="text-gray-500 font-medium">Employee ID:</span>
              <span className="font-bold text-gray-900">EMP-{String(emp.id).padStart(4, '0')}</span>
            </div>
            
            <div className="border-b border-dashed border-gray-300 pb-2 flex justify-between">
              <span className="text-gray-500 font-medium">Designation:</span>
              <span className="font-bold text-gray-900">{emp.designation || emp.type || "Staff"}</span>
            </div>
            <div className="border-b border-dashed border-gray-300 pb-2 flex justify-between">
              <span className="text-gray-500 font-medium">Department:</span>
              <span className="font-bold text-gray-900">{emp.department?.name || emp.departmentName || "General"}</span>
            </div>

            <div className="border-b border-dashed border-gray-300 pb-2 flex justify-between">
              <span className="text-gray-500 font-medium">Payment Date:</span>
              <span className="font-bold text-gray-900">
                {payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString("en-PK", { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
              </span>
            </div>
            <div className="border-b border-dashed border-gray-300 pb-2 flex justify-between">
              <span className="text-gray-500 font-medium">Payment Method:</span>
              <span className="font-bold text-gray-900">Bank Transfer</span>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 font-bold border-b-2 border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left uppercase tracking-wider text-xs">Earnings & Deductions</th>
                  <th className="py-3 px-4 text-right uppercase tracking-wider text-xs w-48">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 text-gray-800 font-medium">Basic Salary</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">₨ {basic.toLocaleString()}</td>
                </tr>
                {bonus > 0 && (
                  <tr className="bg-emerald-50/50">
                    <td className="py-3 px-4 text-emerald-700 font-medium flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">+</span>
                      Allowances & Bonus
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">₨ {bonus.toLocaleString()}</td>
                  </tr>
                )}
                {deductions > 0 && (
                  <tr className="bg-red-50/50">
                    <td className="py-3 px-4 text-red-700 font-medium flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-[10px]">-</span>
                      Tax & Deductions
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-red-700">₨ {deductions.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-emerald-800 text-white font-bold">
                <tr>
                  <td className="py-4 px-4 text-lg">NET TAKE-HOME SALARY</td>
                  <td className="py-4 px-4 text-right text-lg">₨ {net.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <p className="text-center text-xs text-gray-500 italic mb-12">
            * This is a computer-generated document and does not require a physical signature if issued electronically.
          </p>

          {/* Footer Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-12 text-sm text-center">
            <div>
              <div className="border-b border-gray-400 w-full mx-auto mb-2 h-8"></div>
              <p className="font-semibold text-gray-700">Employee Signature</p>
            </div>
            <div>
              <div className="border-b border-gray-400 w-full mx-auto mb-2 h-8">
                {isPaid && <span className="text-emerald-700 font-bold opacity-30 uppercase tracking-widest">Authorized</span>}
              </div>
              <p className="font-semibold text-gray-700">HR Manager / Admin</p>
            </div>
          </div>
        </div>

        {/* Global Print Styles specifically for this modal */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-payslip, #printable-payslip * {
              visibility: visible;
            }
            #printable-payslip {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0 !important;
              margin: 0 !important;
            }
            /* Force background colors to print */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}} />
      </DialogContent>
    </Dialog>
  )
}
