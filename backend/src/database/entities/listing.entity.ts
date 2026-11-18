import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ListingStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  EXCHANGED = 'EXCHANGED',
}

@Entity({ name: 'listings' })
@Check(
  'CHK_listings_status',
  `"status" IN ('AVAILABLE', 'RESERVED', 'EXCHANGED')`,
)
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id', type: 'varchar', length: 36 })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.listings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 60 })
  category: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'is_free', type: 'boolean', default: true })
  isFree: boolean;

  @Column({ name: 'exchange_for', type: 'varchar', length: 200, nullable: true })
  exchangeFor: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: ListingStatus.AVAILABLE,
  })
  status: ListingStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
