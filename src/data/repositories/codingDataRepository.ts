/**
 * The single place the app asks for data.
 * Pages never call Supabase or the synthetic generator directly.
 * To add a new data source, implement CodingDataRepository and return it here.
 */
import { DATA_SOURCE_MODE } from '../../config/env';
import type { CodingDataset } from '../../types/domain';
import { supabaseCodingDataRepository } from './supabaseRepository';
import { syntheticCodingDataRepository } from './syntheticRepository';

export interface CodingDataRepository {
  loadDataset(): Promise<CodingDataset>;
}

export function getCodingDataRepository(): CodingDataRepository {
  return DATA_SOURCE_MODE === 'supabase' ? supabaseCodingDataRepository : syntheticCodingDataRepository;
}
