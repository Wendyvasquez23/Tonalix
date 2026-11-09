import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { AudioService } from './audio.service.js';

describe('AudioService', () => {
  let directory: string;
  let file: Express.Multer.File;

  const engine = {
    analyze: vi.fn(),
    transpose: vi.fn(),
  };

  const service = new AudioService(engine as never);

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    directory = mkdtempSync(join(tmpdir(), 'audio-service-'));

    const path = join(directory, 'upload.mp3');
    writeFileSync(path, 'audio');

    file = { path, originalname: 'song.mp3' } as Express.Multer.File;
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it('deletes the upload after a successful analysis', async () => {
    engine.analyze.mockResolvedValue({ analysis: { key: 'C' } });

    const result = await service.create(file);

    expect(result.analysis).toEqual({ key: 'C' });
    expect(existsSync(file.path)).toBe(false);
  });

  it('deletes the upload when the analysis fails', async () => {
    engine.analyze.mockRejectedValue(new Error('engine down'));

    await expect(service.create(file)).rejects.toThrow();
    expect(existsSync(file.path)).toBe(false);
  });

  it('deletes the upload after a successful transposition', async () => {
    const audio = Buffer.from('processed');
    engine.transpose.mockResolvedValue(audio);

    await expect(service.transpose(file, 2)).resolves.toBe(audio);
    expect(existsSync(file.path)).toBe(false);
  });

  it('deletes the upload when the transposition fails', async () => {
    engine.transpose.mockRejectedValue(new Error('engine down'));

    await expect(service.transpose(file, 2)).rejects.toThrow();
    expect(existsSync(file.path)).toBe(false);
  });
});
