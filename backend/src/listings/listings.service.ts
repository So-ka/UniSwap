import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Listing, ListingStatus } from '../database/entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES } from './listing.constants';

export interface UploadedPhoto {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface ListingResponse {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  photoUrl: string | null;
  isFree: boolean;
  exchangeFor: string | null;
  status: ListingStatus;
  createdAt: Date;
}

export interface ListingPage {
  items: ListingResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads');

function hasImageSignature(buffer: Buffer, mimetype: string): boolean {
  switch (mimetype) {
    case 'image/jpeg':
      return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return (
        buffer.length > 8 &&
        buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      );
    case 'image/webp':
      return (
        buffer.length > 12 &&
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    default:
      return false;
  }
}

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listings: Repository<Listing>,
  ) {}

  async create(
    ownerId: string,
    input: CreateListingDto,
    photo?: UploadedPhoto,
  ): Promise<ListingResponse> {
    let photoName: string | null = null;

    if (photo) {
      const extension = ALLOWED_PHOTO_TYPES[photo.mimetype];

      if (!extension || !hasImageSignature(photo.buffer, photo.mimetype)) {
        throw new BadRequestException('Photo must be a JPG, PNG or WebP image.');
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        throw new BadRequestException('Photo must be 2 MB or smaller.');
      }

      photoName = `${randomUUID()}.${extension}`;
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(join(UPLOAD_DIR, photoName), photo.buffer);
    }

    const listing = this.listings.create({
      ownerId,
      title: input.title,
      description: input.description,
      category: input.category,
      isFree: input.isFree,
      exchangeFor: input.isFree ? null : (input.exchangeFor ?? null),
      photoUrl: photoName ? `/api/listings/photos/${photoName}` : null,
      status: ListingStatus.AVAILABLE,
    });

    try {
      return toListingResponse(await this.listings.save(listing));
    } catch (error: unknown) {
      if (photoName) {
        await unlink(join(UPLOAD_DIR, photoName)).catch(() => undefined);
      }
      throw error;
    }
  }

  async findPage(page: number, pageSize: number): Promise<ListingPage> {
    const [items, total] = await this.listings.findAndCount({
      where: { status: Not(ListingStatus.EXCHANGED) },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map(toListingResponse),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }
}

function toListingResponse(listing: Listing): ListingResponse {
  return {
    id: listing.id,
    ownerId: listing.ownerId,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    photoUrl: listing.photoUrl,
    isFree: listing.isFree,
    exchangeFor: listing.exchangeFor,
    status: listing.status,
    createdAt: listing.createdAt,
  };
}
