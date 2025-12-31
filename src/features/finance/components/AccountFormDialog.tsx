import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { useState } from "react";

import {
  useCreateAccount,
  useUpdateAccount,
} from "@/lib/api/mutations/useFinance";
import { useAccounts } from "@/lib/api/queries/useFinance";
import {
  AccountType,
  type Account,
  type CreateAccountDto,
} from "@/types/api.types";

interface AccountFormDialogProps {
  open: boolean;
  account?: Account;
  onClose: () => void;
}

export function AccountFormDialog({
  open,
  account,
  onClose,
}: AccountFormDialogProps) {
  const getInitialFormData = (): CreateAccountDto => {
    if (account) {
      return {
        code: account.code,
        name: account.name,
        type: account.type,
        isControlAccount: account.isControlAccount,
        parentAccountId: account.parentAccountId,
      };
    }
    return {
      code: "",
      name: "",
      type: AccountType.ASSET,
      isControlAccount: false,
    };
  };

  const [formData, setFormData] =
    useState<CreateAccountDto>(getInitialFormData);

  const { data: accounts } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const handleSubmit = async () => {
    if (account) {
      await updateAccount.mutateAsync({ id: account.id, data: formData });
    } else {
      await createAccount.mutateAsync(formData);
    }
    onClose();
  };

  const accountTypes: AccountType[] = [
    AccountType.ASSET,
    AccountType.LIABILITY,
    AccountType.EQUITY,
    AccountType.INCOME,
    AccountType.EXPENSE,
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      key={account?.id || "new"}
    >
      <DialogTitle>{account ? "Edit Account" : "New Account"}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Account Code"
          fullWidth
          required
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., 1010"
        />

        <TextField
          margin="dense"
          label="Account Name"
          fullWidth
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Cash in Hand"
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>Account Type</InputLabel>
          <Select
            value={formData.type}
            label="Account Type"
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as AccountType })
            }
          >
            {accountTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel>Parent Account (Optional)</InputLabel>
          <Select
            value={formData.parentAccountId || ""}
            label="Parent Account (Optional)"
            onChange={(e) =>
              setFormData({
                ...formData,
                parentAccountId: e.target.value || undefined,
              })
            }
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {accounts
              ?.filter((acc) => acc.id !== account?.id)
              .map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={formData.isControlAccount}
              onChange={(e) =>
                setFormData({ ...formData, isControlAccount: e.target.checked })
              }
            />
          }
          label="Control Account"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !formData.code ||
            !formData.name ||
            createAccount.isPending ||
            updateAccount.isPending
          }
        >
          {account ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
