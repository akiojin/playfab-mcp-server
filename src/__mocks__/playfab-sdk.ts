/**
 * Mock for playfab-sdk module
 */
import {
  mockPlayFab,
  mockPlayFabAdminAPI,
  mockPlayFabAuthenticationAPI,
  mockPlayFabEconomyAPI,
  mockPlayFabProfileAPI,
  mockPlayFabServerAPI,
} from '../__tests__/mocks/playfab';

module.exports = {
  PlayFab: mockPlayFab,
  PlayFabAdmin: mockPlayFabAdminAPI,
  PlayFabAuthentication: mockPlayFabAuthenticationAPI,
  PlayFabEconomy: mockPlayFabEconomyAPI,
  PlayFabProfiles: mockPlayFabProfileAPI,
  PlayFabServer: mockPlayFabServerAPI,
};