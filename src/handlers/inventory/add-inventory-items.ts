import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";
import { 
  validateString, 
  validateNumber, 
  validateObject, 
  validatePlayerId,
  validateCurrencyAmount 
} from "../../utils/input-validator.js";

interface AddInventoryItemsParams {
  Amount: number;
  CollectionId?: string;
  DurationInSeconds?: number;
  IdempotencyId?: string;
  Item: any;
  NewStackValues?: any;
  Entity: {
    Id: string;
    Type: string;
  };
}

export async function AddInventoryItems(params: any) {
  // Validate required parameters
  const titlePlayerAccountId = validatePlayerId(params.TitlePlayerAccountId, 'TitlePlayerAccountId');
  const amount = validateCurrencyAmount(params.Amount, 'Amount');
  
  if (!titlePlayerAccountId) {
    throw new Error('TitlePlayerAccountId is required');
  }

  // Build request with validated parameters
  const validatedParams: AddInventoryItemsParams = {
    Amount: amount,
    Item: validateObject(params.Item, 'Item', { required: true }),
    Entity: {
      Id: titlePlayerAccountId,
      Type: "title_player_account"
    }
  };

  // Optional parameters
  const collectionId = validateString(params.CollectionId, 'CollectionId');
  if (collectionId) validatedParams.CollectionId = collectionId;

  const durationInSeconds = validateNumber(params.DurationInSeconds, 'DurationInSeconds', {
    min: 0,
    integer: true
  });
  if (durationInSeconds !== undefined) validatedParams.DurationInSeconds = durationInSeconds;

  const idempotencyId = validateString(params.IdempotencyId, 'IdempotencyId');
  if (idempotencyId) validatedParams.IdempotencyId = idempotencyId;

  if (params.NewStackValues !== undefined) {
    validatedParams.NewStackValues = validateObject(params.NewStackValues, 'NewStackValues');
  }

  // Make API call with validated parameters
  const request = addCustomTags(validatedParams);
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.AddInventoryItems,
    request as any,
    'AddInventoryItems'
  );
  
  return {
    success: true,
    eTag: result.ETag,
    idempotencyId: result.IdempotencyId,
    transactionIds: result.TransactionIds,
  };
}
