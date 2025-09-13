import {
  Injectable,
  ConflictException,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Entry } from '../entities/entry.entity';
import { CustomField } from '../entities/custom-field.entity';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { IEntryService } from '../interfaces/entry-service.interface';
import { IEntryRepository } from '../interfaces/entry-repository.interface';

@Injectable()
export class EntryService implements IEntryService {
  private readonly logger = new Logger(EntryService.name);

  constructor(
    @Inject('IEntryRepository')
    private readonly entryRepository: IEntryRepository,
  ) {}

  async create(createEntryDto: CreateEntryDto): Promise<Entry> {
    this.logger.log(`Creating entry for email: ${createEntryDto.email}`);

    const existingEntry = await this.entryRepository.findByEmail(
      createEntryDto.email,
    );
    if (existingEntry) {
      this.logger.warn(
        `Entry creation failed - email already exists: ${createEntryDto.email}`,
      );
      throw new ConflictException('An entry with this email already exists');
    }

    const customFieldsCount = createEntryDto.customFields?.length || 0;
    this.logger.log(`Creating entry with ${customFieldsCount} custom fields`);

    const result = await this.entryRepository.create(createEntryDto);
    this.logger.log(`Successfully created entry with ID: ${result.id}`);
    return result;
  }

  async findAll(): Promise<Entry[]> {
    this.logger.log('Fetching all entries from database');
    const result = await this.entryRepository.findAll();
    this.logger.log(
      `Successfully fetched ${result.length} entries from database`,
    );
    return result;
  }

  async getCustomFieldsByEntryId(entryId: string): Promise<CustomField[]> {
    this.logger.log(`Fetching custom fields for entry ID: ${entryId}`);

    const entry = await this.entryRepository.findById(entryId);
    if (!entry) {
      this.logger.warn(
        `Custom fields request failed - entry not found: ${entryId}`,
      );
      throw new NotFoundException(`Entry with ID ${entryId} not found`);
    }

    const result = await this.entryRepository.getCustomFieldsByEntryId(entryId);
    this.logger.log(
      `Successfully fetched ${result.length} custom fields for entry: ${entryId}`,
    );
    return result;
  }
}
