import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayerAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { 
  validateString, 
  validateNumber, 
  validateObject, 
  validatePlayerId,
  validateCurrencyAmount 
} from "../../utils/input-validator.js";
import { HandlerResponse, PlayFabHandler } from "../../types/index.js";
import { AddInventoryItemsResponse } from "../../types/playfab-responses.js";
import { AddInventoryItemsParams } from "../../types/tool-params.js";

interface AddInventoryItemsRequestParams {
  Amount: number;
  CollectionId?: string;
  DurationInSeconds?: number;
  IdempotencyId?: string;
  Item: Record<string, unknown>;
  NewStackValues?: Record<string, unknown>;
  Entity: {
    Id: string;
    Type: string;
  };
}

interface AddInventoryItemsResult {
  eTag?: string;
  idempotencyId?: string;
  transactionIds?: string[];
}

export const AddInventoryItems: PlayFabHandler<AddInventoryItemsParams, AddInventoryItemsResult> = async (params) => {
  // Validate required parameters
  const titlePlayerAccountId = validatePlayerId(params.TitlePlayerAccountId, 'TitlePlayerAccountId');
  const amount = validateCurrencyAmount(params.Amount, 'Amount');
  
  if (!titlePlayerAccountId) {
    throw new Error('TitlePlayerAccountId is required');
  }

  // Build request with validated parameters
  const itemObject = validateObject(params.Item, 'Item', { required: true });
  if (!itemObject) {
    throw new Error('Item is required');
  }

  const validatedParams: AddInventoryItemsRequestParams = {
    Amount: amount,
    Item: itemObject,
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
  const result = await callPlayerAPI(
    PlayFabEconomyAPI.AddInventoryItems,
    request,
    'AddInventoryItems'
  );
  
  return {
    success: true,
    eTag: result.ETag,
    idempotencyId: result.IdempotencyId,
    transactionIds: result.TransactionIds,
  } as HandlerResponse<AddInventoryItemsResult>;
}
