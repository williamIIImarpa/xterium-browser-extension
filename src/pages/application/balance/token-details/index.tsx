import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import type { BalanceModel } from "@/models/balance.model"
import React, { useState } from "react"

import IndexTransfer from "./transfer"

const IndexTokenDetails = ({ selectedBalance, handleCallbacks }) => {
  const [balanceData, setBalanceData] = useState<BalanceModel>(selectedBalance)
  const [isTransferDrawerOpen, setIsTransferDrawerOpen] = useState(false)

  const openTransferDrawer = () => {
    setIsTransferDrawerOpen(true)
  }

  const formatBalance = (balance: string) => {
    const parsedBalance = parseFloat(balance)
    return isNaN(parsedBalance) ? "0.00" : parsedBalance.toFixed(2)
  }

  const transferComplete = () => {
    setIsTransferDrawerOpen(false)
    handleCallbacks()
  }

  return (
    <>
      <Label className="mt-4 tracking-[0.15em] font-semibold text-sm text-center">
        Your Balance
      </Label>
      <Table className="mt-6 w-full">
        <TableBody>
          <TableRow className="flex justify-center gap-4 hover:bg-transparent hover:cursor-default">
            <TableCell className="w-24 h-24 flex items-center justify-center text-center bg-tablecell-detail rounded-xl relative border-2 border-primary dark:border-border dark:bg-muted/50">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-purple">
                  {formatBalance(
                    (balanceData.freeBalance + balanceData.reservedBalance).toString()
                  )}
                </p>
                <Label className="text-sm font-semibold">Total</Label>
              </div>
            </TableCell>
            <TableCell className="w-24 h-24 flex items-center justify-center bg-tablecell-detail rounded-xl relative border-2 border-primary dark:border-border dark:bg-muted/50">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-purple">
                  {formatBalance(balanceData.freeBalance.toString())}
                </p>
                <Label className="text-sm font-semibold">Transferable</Label>
              </div>
            </TableCell>
            <TableCell className="w-24 h-24 flex items-center justify-center bg-tablecell-detail rounded-xl relative border-2 border-primary dark:border-border dark:bg-muted/50">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-purple">0.00</p>
                <Label className="text-sm font-semibold">Locked</Label>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="p-6">
        <Button variant="jelly" type="button" onClick={openTransferDrawer}>
          TRANSFER
        </Button>
      </div>

      <Drawer open={isTransferDrawerOpen} onOpenChange={setIsTransferDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center text-purple">TRANSFER</DrawerTitle>
          </DrawerHeader>
          <IndexTransfer
            selectedBalance={selectedBalance}
            handleCallbacks={transferComplete}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexTokenDetails
