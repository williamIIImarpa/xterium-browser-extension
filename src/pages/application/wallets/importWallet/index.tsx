import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model"
import { WalletService } from "@/services/wallet.service"
import { u8aToHex } from "@polkadot/util"
import {
  cryptoWaitReady,
  encodeAddress,
  mnemonicToMiniSecret,
  mnemonicValidate,
  sr25519PairFromSeed
} from "@polkadot/util-crypto"
import { Check, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import "@polkadot/wasm-crypto/initOnlyAsm"

import type { NetworkModel } from "@/models/network.model"
import { EncryptionService } from "@/services/encryption.service"
import { NetworkService } from "@/services/network.service"
import { UserService } from "@/services/user.service"

const IndexImportWallet = ({ handleCallbacks }) => {
  const { t } = useTranslation()
  const networkService = new NetworkService()
  const userService = new UserService()
  const walletService = new WalletService()

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [walletData, setWalletData] = useState<WalletModel>({
    id: 0,
    name: "",
    address_type: "",
    mnemonic_phrase: "",
    secret_key: "",
    public_key: ""
  })

  const { toast } = useToast()

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  useEffect(() => {
    getNetwork()
  }, [])

  const handleInputChange = (field: keyof typeof walletData, value: string) => {
    setWalletData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result as string)

          if (jsonData.mnemonic_phrase && mnemonicValidate(jsonData.mnemonic_phrase)) {
            handleInputChange("mnemonic_phrase", jsonData.mnemonic_phrase)
            handleInputChange("secret_key", jsonData.secret_key || "")
            handleInputChange("public_key", jsonData.public_key || "")
            createKeys(jsonData.mnemonic_phrase)
          } else {
            toast({
              description: (
                <div className="flex items-center">
                  <X className="mr-2 text-red-500" />
                  {t("Invalid mnemonic phrase in JSON!")}
                </div>
              ),
              variant: "destructive"
            })
          }
        } catch (error) {
          toast({
            description: (
              <div className="flex items-center">
                <X className="mr-2 text-red-500" />
                {t("Failed to read the JSON file!")}
              </div>
            ),
            variant: "destructive"
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const createKeys = (mnemonicPhrase) => {
    cryptoWaitReady().then(() => {
      const seed = mnemonicToMiniSecret(mnemonicPhrase)
      const { publicKey, secretKey } = sr25519PairFromSeed(seed)

      handleInputChange("secret_key", u8aToHex(secretKey))
      handleInputChange("public_key", encodeAddress(publicKey))
    })
  }

  const saveWallet = () => {
    if (
      !walletData.name ||
      !walletData.mnemonic_phrase ||
      !walletData.secret_key ||
      !walletData.public_key
    ) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t("All fields must be filled out!")}
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    userService.getWalletPassword().then((decryptedPassword) => {
      if (decryptedPassword) {
        const encryptionService = new EncryptionService()

        const mnemonic_phrase = encryptionService.encrypt(
          decryptedPassword,
          walletData.mnemonic_phrase
        )
        const secret_key = encryptionService.encrypt(
          decryptedPassword,
          walletData.secret_key
        )

        walletData.mnemonic_phrase = mnemonic_phrase
        walletData.secret_key = secret_key
        walletData.address_type = selectedNetwork ? selectedNetwork.name : ""

        walletService.createWallet(walletData).then((result) => {
          if (result != null) {
            toast({
              description: (
                <div className="flex items-center">
                  <Check className="mr-2 text-green-500" />
                  {t("Wallet Imported Successfully!")}
                </div>
              ),
              variant: "default"
            })
          }
        })

        handleCallbacks()
      }
    })
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-3">
          <Label>{t("Enter a unique wallet name")}:</Label>
          <Input
            type="text"
            placeholder={t("Wallet Name")}
            value={walletData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>

        <div className="mb-3">
          <Label>{t("Upload Wallet JSON")}:</Label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="w-full p-2 rounded bg-input text-sm font-semibold"
          />
        </div>

        <div className="mt-5 mb-3">
          <Button type="button" variant="jelly" onClick={saveWallet}>
            {t("SAVE")}
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexImportWallet
