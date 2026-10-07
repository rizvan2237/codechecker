import { loadSyntheticDataset } from '../synthetic/syntheticDataset';
import type { CodingDataRepository } from './codingDataRepository';

export const syntheticCodingDataRepository: CodingDataRepository = {
  loadDataset: loadSyntheticDataset,
};
