import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialSchema1731600000000 implements MigrationInterface {
  name = 'InitialSchema1731600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          { name: 'name', type: 'varchar', length: '100' },
          {
            name: 'email',
            type: 'varchar',
            length: '254',
            isUnique: true,
          },
          { name: 'password_hash', type: 'varchar', length: '100' },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'listings',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          { name: 'owner_id', type: 'varchar', length: '36' },
          { name: 'title', type: 'varchar', length: '120' },
          { name: 'description', type: 'text' },
          { name: 'category', type: 'varchar', length: '60' },
          {
            name: 'photo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'is_free', type: 'boolean', default: true },
          {
            name: 'exchange_for',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'AVAILABLE'",
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_listings_owner',
            columnNames: ['owner_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        checks: [
          {
            name: 'CHK_listings_status',
            expression:
              `"status" IN ('AVAILABLE', 'RESERVED', 'EXCHANGED')`,
          },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('listings');
    await queryRunner.dropTable('users');
  }
}
