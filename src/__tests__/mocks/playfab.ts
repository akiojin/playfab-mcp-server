/**
 * Mock implementations for PlayFab SDK
 */

export const mockPlayFabError = {
  error: 'TestError',
  errorCode: 1000,
  errorMessage: 'Test error message',
  code: 400,
};

export const mockPlayFabSuccess = <T>(data: T) => ({
  data,
});

// Mock PlayFab SDK modules
export const mockPlayFab = {
  settings: {
    titleId: 'TEST1',
    developerSecretKey: 'testsecretkey123456789012345678901234567890',
  },
};

export const mockPlayFabAdminAPI = {
  GetAllSegments: jest.fn(),
  GetPlayersInSegment: jest.fn(),
  BanUsers: jest.fn(),
  RevokeAllBansForUser: jest.fn(),
  GetUserAccountInfo: jest.fn(),
  GetUserData: jest.fn(),
  UpdateUserData: jest.fn(),
  GetTitleData: jest.fn(),
  SetTitleData: jest.fn(),
  GetTitleInternalData: jest.fn(),
  SetTitleInternalData: jest.fn(),
  GetTitleNews: jest.fn(),
  AddLocalizedNews: jest.fn(),
};

export const mockPlayFabAuthenticationAPI = {
  GetEntityToken: jest.fn(),
};

export const mockPlayFabEconomyAPI = {
  SearchItems: jest.fn(),
  CreateDraftItem: jest.fn(),
  UpdateDraftItem: jest.fn(),
  DeleteItem: jest.fn(),
  PublishDraftItem: jest.fn(),
  GetItem: jest.fn(),
  UpdateCatalogConfig: jest.fn(),
  GetCatalogConfig: jest.fn(),
  AddInventoryItems: jest.fn(),
  GetInventoryItems: jest.fn(),
  GetInventoryCollectionIds: jest.fn(),
  DeleteInventoryItems: jest.fn(),
  SubtractInventoryItems: jest.fn(),
  UpdateInventoryItems: jest.fn(),
  ExecuteInventoryOperations: jest.fn(),
};

export const mockPlayFabProfileAPI = {
  GetProfile: jest.fn(),
  GetProfiles: jest.fn(),
  GetTitlePlayersFromMasterPlayerAccountIds: jest.fn(),
};

export const mockPlayFabServerAPI = {
  GrantItemsToUsers: jest.fn(),
};

// Helper to reset all mocks
export function resetAllMocks() {
  jest.clearAllMocks();
}

// Helper to setup common mock responses
export function setupCommonMocks() {
  // Mock GetEntityToken to always succeed
  mockPlayFabAuthenticationAPI.GetEntityToken.mockImplementation((request, callback) => {
    callback(null, mockPlayFabSuccess({
      EntityToken: 'mock-entity-token',
      TokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));
  });
}