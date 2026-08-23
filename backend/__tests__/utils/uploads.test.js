const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const sharp = require('sharp');

async function makeImage({ width, height, format }) {
  const image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 118, g: 76, b: 42 },
    },
  });

  if (format === 'jpeg') return image.jpeg({ quality: 92 }).toBuffer();
  if (format === 'png') return image.png().toBuffer();
  if (format === 'webp') return image.webp({ quality: 92 }).toBuffer();
  throw new Error(`Unsupported format ${format}`);
}

function dataUrl(buffer, mime) {
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

describe('saveBase64Upload image optimization', () => {
  let tempDir;
  let saveBase64Upload;
  let IMAGE_EXTENSIONS;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acaro-uploads-'));
    jest.resetModules();
    jest.doMock('../../src/config/uploads', () => ({ uploadRoot: tempDir }));
    ({ saveBase64Upload, IMAGE_EXTENSIONS } = require('../../src/utils/uploads'));
  });

  afterEach(async () => {
    jest.dontMock('../../src/config/uploads');
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  async function uploadRaster({ width, height, format, fileName, mime }) {
    const buffer = await makeImage({ width, height, format });
    return saveBase64Upload({
      base64: dataUrl(buffer, mime),
      fileName,
      subdir: 'noticias',
      maxBytes: 20 * 1024 * 1024,
      allowedExtensions: IMAGE_EXTENSIONS,
    });
  }

  test('optimizes a large JPG without upscaling', async () => {
    const uploaded = await uploadRaster({
      width: 2400,
      height: 1600,
      format: 'jpeg',
      fileName: 'cafe.jpg',
      mime: 'image/jpeg',
    });

    expect(uploaded.url).toMatch(/\/uploads\/noticias\/.+-2400\.webp$/);
    expect(uploaded.variants.map(v => v.width)).toEqual([
      480, 480, 768, 768, 1200, 1200, 1920, 1920, 2400, 2400,
    ]);
  });

  test('optimizes PNG uploads and strips original format from canonical URL', async () => {
    const uploaded = await uploadRaster({
      width: 900,
      height: 600,
      format: 'png',
      fileName: 'portada.png',
      mime: 'image/png',
    });

    expect(uploaded.url).toMatch(/-900\.webp$/);
    expect(uploaded.mimeType).toBe('image/webp');
    expect(uploaded.variants.map(v => v.width)).toEqual([480, 480, 768, 768, 900, 900]);
  });

  test('optimizes WebP uploads', async () => {
    const uploaded = await uploadRaster({
      width: 1200,
      height: 800,
      format: 'webp',
      fileName: 'productor.webp',
      mime: 'image/webp',
    });

    expect(uploaded.url).toMatch(/-1200\.webp$/);
    expect(uploaded.variants.some(v => v.format === 'avif')).toBe(true);
    expect(uploaded.variants.some(v => v.format === 'webp')).toBe(true);
  });

  test('rejects invalid image content', async () => {
    await expect(saveBase64Upload({
      base64: dataUrl(Buffer.from('not an image'), 'image/jpeg'),
      fileName: 'fake.jpg',
      subdir: 'noticias',
      maxBytes: 1024,
      allowedExtensions: IMAGE_EXTENSIONS,
    })).rejects.toMatchObject({ status: 400 });
  });

  test('does not upscale images smaller than 480px', async () => {
    const uploaded = await uploadRaster({
      width: 320,
      height: 240,
      format: 'jpeg',
      fileName: 'small.jpg',
      mime: 'image/jpeg',
    });

    expect(uploaded.url).toMatch(/-320\.webp$/);
    expect([...new Set(uploaded.variants.map(v => v.width))]).toEqual([320]);
  });

  test('caps 4K images at 2560px', async () => {
    const uploaded = await uploadRaster({
      width: 3840,
      height: 2160,
      format: 'jpeg',
      fileName: '4k.jpg',
      mime: 'image/jpeg',
    });

    expect(uploaded.url).toMatch(/-2560\.webp$/);
    expect(Math.max(...uploaded.variants.map(v => v.width))).toBe(2560);
  });

  test('preserves vertical orientation', async () => {
    const uploaded = await uploadRaster({
      width: 900,
      height: 1400,
      format: 'jpeg',
      fileName: 'vertical.jpg',
      mime: 'image/jpeg',
    });

    const filePath = path.join(tempDir, uploaded.url.replace('/uploads/', ''));
    const metadata = await sharp(await fs.readFile(filePath)).metadata();
    expect(metadata.height).toBeGreaterThan(metadata.width);
  });

  test('preserves horizontal orientation', async () => {
    const uploaded = await uploadRaster({
      width: 1400,
      height: 900,
      format: 'jpeg',
      fileName: 'horizontal.jpg',
      mime: 'image/jpeg',
    });

    const filePath = path.join(tempDir, uploaded.url.replace('/uploads/', ''));
    const metadata = await sharp(await fs.readFile(filePath)).metadata();
    expect(metadata.width).toBeGreaterThan(metadata.height);
  });

  test('rejects mismatched MIME type and extension', async () => {
    const buffer = await makeImage({ width: 640, height: 480, format: 'png' });
    await expect(saveBase64Upload({
      base64: dataUrl(buffer, 'image/jpeg'),
      fileName: 'wrong.png',
      subdir: 'noticias',
      maxBytes: 1024 * 1024,
      allowedExtensions: IMAGE_EXTENSIONS,
    })).rejects.toMatchObject({ status: 400 });
  });
});
