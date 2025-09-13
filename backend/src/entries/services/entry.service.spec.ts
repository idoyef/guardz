import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EntryService } from './entry.service';
import { IEntryRepository } from '../interfaces/entry-repository.interface';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { Entry } from '../entities/entry.entity';
import { CustomField } from '../entities/custom-field.entity';

describe('EntryService', () => {
  let service: EntryService;
  let repository: jest.Mocked<IEntryRepository>;

  const mockCustomFields: CustomField[] = [
    {
      id: 'cf1',
      key: 'company',
      value: 'Acme Corp',
      entryId: '1',
      entry: null,
    },
    {
      id: 'cf2',
      key: 'department',
      value: 'Engineering',
      entryId: '1',
      entry: null,
    },
  ];

  const mockEntry: Entry = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123456789',
    message: 'Test message',
    customFields: mockCustomFields,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEntryWithoutCustomFields: Entry = {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '987654321',
    message: 'Another test message',
    customFields: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateEntryDto: CreateEntryDto = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123456789',
    message: 'Test message',
    customFields: [
      { key: 'company', value: 'Acme Corp' },
      { key: 'department', value: 'Engineering' },
    ],
  };

  const mockCreateEntryDtoWithoutCustomFields: CreateEntryDto = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '987654321',
    message: 'Another test message',
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      getCustomFieldsByEntryId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntryService,
        {
          provide: 'IEntryRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EntryService>(EntryService);
    repository = module.get('IEntryRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new entry with custom fields when email does not exist', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockEntry);

      const result = await service.create(mockCreateEntryDto);

      expect(repository.findByEmail).toHaveBeenCalledWith(
        mockCreateEntryDto.email,
      );
      expect(repository.create).toHaveBeenCalledWith(mockCreateEntryDto);
      expect(result).toEqual(mockEntry);
      expect(result.customFields).toHaveLength(2);
      expect(result.customFields[0].key).toBe('company');
      expect(result.customFields[0].value).toBe('Acme Corp');
    });

    it('should create a new entry without custom fields when email does not exist', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockEntryWithoutCustomFields);

      const result = await service.create(
        mockCreateEntryDtoWithoutCustomFields,
      );

      expect(repository.findByEmail).toHaveBeenCalledWith(
        mockCreateEntryDtoWithoutCustomFields.email,
      );
      expect(repository.create).toHaveBeenCalledWith(
        mockCreateEntryDtoWithoutCustomFields,
      );
      expect(result).toEqual(mockEntryWithoutCustomFields);
      expect(result.customFields).toHaveLength(0);
    });

    it('should create a new entry with empty custom fields array', async () => {
      const dtoWithEmptyCustomFields = {
        ...mockCreateEntryDtoWithoutCustomFields,
        customFields: [],
      };
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockEntryWithoutCustomFields);

      const result = await service.create(dtoWithEmptyCustomFields);

      expect(repository.findByEmail).toHaveBeenCalledWith(
        dtoWithEmptyCustomFields.email,
      );
      expect(repository.create).toHaveBeenCalledWith(dtoWithEmptyCustomFields);
      expect(result).toEqual(mockEntryWithoutCustomFields);
      expect(result.customFields).toHaveLength(0);
    });

    it('should create a new entry with single custom field', async () => {
      const dtoWithSingleCustomField = {
        ...mockCreateEntryDtoWithoutCustomFields,
        customFields: [{ key: 'role', value: 'Developer' }],
      };
      const entryWithSingleCustomField = {
        ...mockEntryWithoutCustomFields,
        customFields: [
          {
            id: 'cf3',
            key: 'role',
            value: 'Developer',
            entryId: '2',
            entry: null,
          },
        ],
      };
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(entryWithSingleCustomField);

      const result = await service.create(dtoWithSingleCustomField);

      expect(repository.findByEmail).toHaveBeenCalledWith(
        dtoWithSingleCustomField.email,
      );
      expect(repository.create).toHaveBeenCalledWith(dtoWithSingleCustomField);
      expect(result).toEqual(entryWithSingleCustomField);
      expect(result.customFields).toHaveLength(1);
      expect(result.customFields[0].key).toBe('role');
      expect(result.customFields[0].value).toBe('Developer');
    });

    it('should throw ConflictException when email already exists', async () => {
      repository.findByEmail.mockResolvedValue(mockEntry);

      await expect(service.create(mockCreateEntryDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByEmail).toHaveBeenCalledWith(
        mockCreateEntryDto.email,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all entries with custom fields', async () => {
      const mockEntries = [mockEntry, mockEntryWithoutCustomFields];
      repository.findAll.mockResolvedValue(mockEntries);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockEntries);
      expect(result).toHaveLength(2);

      expect(result[0].customFields).toHaveLength(2);
      expect(result[0].customFields[0].key).toBe('company');
      expect(result[0].customFields[0].value).toBe('Acme Corp');

      expect(result[1].customFields).toHaveLength(0);
    });

    it('should return empty array when no entries exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return entries with mixed custom field scenarios', async () => {
      const entryWithManyCustomFields = {
        ...mockEntry,
        id: '3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        customFields: [
          {
            id: 'cf4',
            key: 'company',
            value: 'Tech Corp',
            entryId: '3',
            entry: null,
          },
          {
            id: 'cf5',
            key: 'department',
            value: 'Sales',
            entryId: '3',
            entry: null,
          },
          {
            id: 'cf6',
            key: 'role',
            value: 'Manager',
            entryId: '3',
            entry: null,
          },
          {
            id: 'cf7',
            key: 'location',
            value: 'Remote',
            entryId: '3',
            entry: null,
          },
        ],
      };

      const mockEntries = [
        mockEntry,
        mockEntryWithoutCustomFields,
        entryWithManyCustomFields,
      ];
      repository.findAll.mockResolvedValue(mockEntries);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockEntries);
      expect(result).toHaveLength(3);

      expect(result[0].customFields).toHaveLength(2);
      expect(result[1].customFields).toHaveLength(0);
      expect(result[2].customFields).toHaveLength(4);

      expect(result[2].customFields[2].key).toBe('role');
      expect(result[2].customFields[2].value).toBe('Manager');
    });
  });

  describe('getCustomFieldsByEntryId', () => {
    it('should return custom fields for existing entry', async () => {
      const entryId = '1';
      repository.findById.mockResolvedValue(mockEntry);
      repository.getCustomFieldsByEntryId.mockResolvedValue(mockCustomFields);

      const result = await service.getCustomFieldsByEntryId(entryId);

      expect(repository.findById).toHaveBeenCalledWith(entryId);
      expect(repository.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
      expect(result).toEqual(mockCustomFields);
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('company');
      expect(result[0].value).toBe('Acme Corp');
    });

    it('should return empty array for entry with no custom fields', async () => {
      const entryId = '2';
      repository.findById.mockResolvedValue(mockEntryWithoutCustomFields);
      repository.getCustomFieldsByEntryId.mockResolvedValue([]);

      const result = await service.getCustomFieldsByEntryId(entryId);

      expect(repository.findById).toHaveBeenCalledWith(entryId);
      expect(repository.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException when entry does not exist', async () => {
      const entryId = 'non-existent';
      repository.findById.mockResolvedValue(null);

      await expect(service.getCustomFieldsByEntryId(entryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(entryId);
      expect(repository.getCustomFieldsByEntryId).not.toHaveBeenCalled();
    });

    it('should return custom fields with specific structure', async () => {
      const entryId = '1';
      const specificCustomFields = [
        {
          id: 'cf8',
          key: 'priority',
          value: 'High',
          entryId: '1',
          entry: null,
        },
      ];
      repository.findById.mockResolvedValue(mockEntry);
      repository.getCustomFieldsByEntryId.mockResolvedValue(
        specificCustomFields,
      );

      const result = await service.getCustomFieldsByEntryId(entryId);

      expect(repository.findById).toHaveBeenCalledWith(entryId);
      expect(repository.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
      expect(result).toEqual(specificCustomFields);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('key');
      expect(result[0]).toHaveProperty('value');
      expect(result[0]).toHaveProperty('entryId');
      expect(result[0].key).toBe('priority');
      expect(result[0].value).toBe('High');
    });
  });
});
