import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entry } from '../entities/entry.entity';
import { CustomField } from '../entities/custom-field.entity';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { IEntryRepository } from '../interfaces/entry-repository.interface';

@Injectable()
export class EntryRepository implements IEntryRepository {
  private readonly logger = new Logger(EntryRepository.name);

  constructor(
    @InjectRepository(Entry)
    private readonly entryRepository: Repository<Entry>,
    @InjectRepository(CustomField)
    private readonly customFieldRepository: Repository<CustomField>,
  ) {}

  async create(createEntryDto: CreateEntryDto): Promise<Entry> {
    const { customFields, ...entryData } = createEntryDto;
    this.logger.debug(`DB: Creating entry for email: ${entryData.email}`);

    const entry = this.entryRepository.create(entryData);
    const savedEntry = await this.entryRepository.save(entry);
    this.logger.debug(`DB: Entry saved with ID: ${savedEntry.id}`);

    if (customFields && customFields.length > 0) {
      this.logger.debug(
        `DB: Creating ${customFields.length} custom fields for entry: ${savedEntry.id}`,
      );
      const customFieldEntities = customFields.map((field) =>
        this.customFieldRepository.create({
          ...field,
          entryId: savedEntry.id,
          entry: savedEntry,
        }),
      );

      const savedCustomFields =
        await this.customFieldRepository.save(customFieldEntities);
      savedEntry.customFields = savedCustomFields;
      this.logger.debug(
        `DB: Successfully saved ${savedCustomFields.length} custom fields`,
      );
    }

    return savedEntry;
  }

  async findAll(): Promise<Entry[]> {
    this.logger.debug('DB: Executing findAll query');
    const result = await this.entryRepository.find({
      order: { createdAt: 'DESC' },
    });
    this.logger.debug(`DB: findAll returned ${result.length} entries`);
    return result;
  }

  async findById(id: string): Promise<Entry | null> {
    this.logger.debug(`DB: Finding entry by ID: ${id}`);
    const result = await this.entryRepository.findOne({
      where: { id },
    });
    this.logger.debug(`DB: findById result: ${result ? 'found' : 'not found'}`);
    return result;
  }

  async findByEmail(email: string): Promise<Entry | null> {
    this.logger.debug(`DB: Finding entry by email: ${email}`);
    const result = await this.entryRepository.findOne({
      where: { email },
    });
    this.logger.debug(
      `DB: findByEmail result: ${result ? 'found' : 'not found'}`,
    );
    return result;
  }

  async getCustomFieldsByEntryId(entryId: string): Promise<CustomField[]> {
    this.logger.debug(`DB: Finding custom fields for entry: ${entryId}`);
    const result = await this.customFieldRepository.find({
      where: { entryId },
      order: { key: 'ASC' },
    });
    this.logger.debug(
      `DB: Found ${result.length} custom fields for entry: ${entryId}`,
    );
    return result;
  }
}
