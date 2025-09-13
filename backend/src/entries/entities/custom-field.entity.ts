import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Entry } from './entry.entity';

@Entity('custom_fields')
export class CustomField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  key: string;

  @Column({ length: 100 })
  value: string;

  @Column({ name: 'entry_id' })
  entryId: string;

  @ManyToOne(() => Entry, (entry) => entry.customFields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entry_id' })
  entry: Entry;
}
