import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Param,
  Logger,
} from '@nestjs/common';
import { EntryService } from '../services/entry.service';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { Entry } from '../entities/entry.entity';
import { CustomField } from '../entities/custom-field.entity';

@Controller('entries')
export class EntryController {
  private readonly logger = new Logger(EntryController.name);

  constructor(private readonly entryService: EntryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEntryDto: CreateEntryDto): Promise<Entry> {
    this.logger.log(
      `POST /entries - Creating entry for email: ${createEntryDto.email}`,
    );
    try {
      const result = await this.entryService.create(createEntryDto);
      this.logger.log(
        `POST /entries - Successfully created entry with ID: ${result.id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `POST /entries - Failed to create entry for email: ${createEntryDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Entry[]> {
    this.logger.log('GET /entries - Fetching all entries');
    try {
      const result = await this.entryService.findAll();
      this.logger.log(
        `GET /entries - Successfully fetched ${result.length} entries`,
      );
      return result;
    } catch (error) {
      this.logger.error('GET /entries - Failed to fetch entries', error.stack);
      throw error;
    }
  }

  @Get(':entryId/custom-fields')
  @HttpCode(HttpStatus.OK)
  async getCustomFieldsByEntryId(
    @Param('entryId') entryId: string,
  ): Promise<CustomField[]> {
    this.logger.log(
      `GET /entries/${entryId}/custom-fields - Fetching custom fields`,
    );
    try {
      const result = await this.entryService.getCustomFieldsByEntryId(entryId);
      this.logger.log(
        `GET /entries/${entryId}/custom-fields - Successfully fetched ${result.length} custom fields`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `GET /entries/${entryId}/custom-fields - Failed to fetch custom fields`,
        error.stack,
      );
      throw error;
    }
  }
}
