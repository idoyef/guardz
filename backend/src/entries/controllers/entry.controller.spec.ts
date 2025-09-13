import { Test, TestingModule } from '@nestjs/testing';
import { EntryController } from './entry.controller';
import { EntryService } from '../services/entry.service';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { Entry } from '../entities/entry.entity';
import { CustomField } from '../entities/custom-field.entity';
import { NotFoundException } from '@nestjs/common';

describe('EntryController', () => {
  let controller: EntryController;
  let service: jest.Mocked<EntryService>;

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
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      getCustomFieldsByEntryId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryController],
      providers: [
        {
          provide: EntryService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EntryController>(EntryController);
    service = module.get(EntryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new entry with custom fields', async () => {
      service.create.mockResolvedValue(mockEntry);

      const result = await controller.create(mockCreateEntryDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateEntryDto);
      expect(result).toEqual(mockEntry);
      expect(result.customFields).toHaveLength(2);
      expect(result.customFields[0].key).toBe('company');
      expect(result.customFields[0].value).toBe('Acme Corp');
      expect(result.customFields[1].key).toBe('department');
      expect(result.customFields[1].value).toBe('Engineering');
    });

    it('should create a new entry without custom fields', async () => {
      service.create.mockResolvedValue(mockEntryWithoutCustomFields);

      const result = await controller.create(
        mockCreateEntryDtoWithoutCustomFields,
      );

      expect(service.create).toHaveBeenCalledWith(
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
      service.create.mockResolvedValue(mockEntryWithoutCustomFields);

      const result = await controller.create(dtoWithEmptyCustomFields);

      expect(service.create).toHaveBeenCalledWith(dtoWithEmptyCustomFields);
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
      service.create.mockResolvedValue(entryWithSingleCustomField);

      const result = await controller.create(dtoWithSingleCustomField);

      expect(service.create).toHaveBeenCalledWith(dtoWithSingleCustomField);
      expect(result).toEqual(entryWithSingleCustomField);
      expect(result.customFields).toHaveLength(1);
      expect(result.customFields[0].key).toBe('role');
      expect(result.customFields[0].value).toBe('Developer');
    });
  });

  describe('findAll', () => {
    it('should return all entries with custom fields', async () => {
      const mockEntries = [mockEntry, mockEntryWithoutCustomFields];
      service.findAll.mockResolvedValue(mockEntries);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockEntries);
      expect(result).toHaveLength(2);

      expect(result[0].customFields).toHaveLength(2);
      expect(result[0].customFields[0].key).toBe('company');
      expect(result[0].customFields[0].value).toBe('Acme Corp');

      expect(result[1].customFields).toHaveLength(0);
    });

    it('should return empty array when no entries exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
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
      service.findAll.mockResolvedValue(mockEntries);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
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
    it('should return custom fields for a valid entry ID', async () => {
      const entryId = '1';
      service.getCustomFieldsByEntryId.mockResolvedValue(mockCustomFields);

      const result = await controller.getCustomFieldsByEntryId(entryId);

      expect(service.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
      expect(result).toEqual(mockCustomFields);
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('company');
      expect(result[0].value).toBe('Acme Corp');
      expect(result[1].key).toBe('department');
      expect(result[1].value).toBe('Engineering');
    });

    it('should return empty array when entry has no custom fields', async () => {
      const entryId = '2';
      service.getCustomFieldsByEntryId.mockResolvedValue([]);

      const result = await controller.getCustomFieldsByEntryId(entryId);

      expect(service.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return single custom field', async () => {
      const entryId = '3';
      const singleCustomField = [
        {
          id: 'cf3',
          key: 'role',
          value: 'Developer',
          entryId: '3',
          entry: null,
        },
      ];
      service.getCustomFieldsByEntryId.mockResolvedValue(singleCustomField);

      const result = await controller.getCustomFieldsByEntryId(entryId);

      expect(service.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
      expect(result).toEqual(singleCustomField);
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('role');
      expect(result[0].value).toBe('Developer');
    });

    it('should return multiple custom fields', async () => {
      const entryId = '4';
      const multipleCustomFields = [
        {
          id: 'cf4',
          key: 'company',
          value: 'Tech Corp',
          entryId: '4',
          entry: null,
        },
        {
          id: 'cf5',
          key: 'department',
          value: 'Sales',
          entryId: '4',
          entry: null,
        },
        {
          id: 'cf6',
          key: 'role',
          value: 'Manager',
          entryId: '4',
          entry: null,
        },
        {
          id: 'cf7',
          key: 'location',
          value: 'Remote',
          entryId: '4',
          entry: null,
        },
      ];
      service.getCustomFieldsByEntryId.mockResolvedValue(multipleCustomFields);

      const result = await controller.getCustomFieldsByEntryId(entryId);

      expect(service.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
      expect(result).toEqual(multipleCustomFields);
      expect(result).toHaveLength(4);
      expect(result[0].key).toBe('company');
      expect(result[1].key).toBe('department');
      expect(result[2].key).toBe('role');
      expect(result[3].key).toBe('location');
    });

    it('should throw NotFoundException when entry does not exist', async () => {
      const entryId = 'nonexistent';
      const notFoundError = new NotFoundException(
        `Entry with ID ${entryId} not found`,
      );
      service.getCustomFieldsByEntryId.mockRejectedValue(notFoundError);

      await expect(
        controller.getCustomFieldsByEntryId(entryId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.getCustomFieldsByEntryId(entryId),
      ).rejects.toThrow(`Entry with ID ${entryId} not found`);

      expect(service.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
    });

    it('should handle service errors and rethrow them', async () => {
      const entryId = '1';
      const serviceError = new Error('Database connection failed');
      service.getCustomFieldsByEntryId.mockRejectedValue(serviceError);

      await expect(
        controller.getCustomFieldsByEntryId(entryId),
      ).rejects.toThrow('Database connection failed');

      expect(service.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
    });

    it('should handle empty entry ID', async () => {
      const entryId = '';
      const notFoundError = new NotFoundException(
        `Entry with ID ${entryId} not found`,
      );
      service.getCustomFieldsByEntryId.mockRejectedValue(notFoundError);

      await expect(
        controller.getCustomFieldsByEntryId(entryId),
      ).rejects.toThrow(NotFoundException);

      expect(service.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
    });

    it('should handle special characters in entry ID', async () => {
      const entryId = 'entry-123_test@special';
      const singleCustomField = [
        {
          id: 'cf8',
          key: 'special',
          value: 'test',
          entryId: entryId,
          entry: null,
        },
      ];
      service.getCustomFieldsByEntryId.mockResolvedValue(singleCustomField);

      const result = await controller.getCustomFieldsByEntryId(entryId);

      expect(service.getCustomFieldsByEntryId).toHaveBeenCalledWith(entryId);
      expect(result).toEqual(singleCustomField);
      expect(result[0].entryId).toBe(entryId);
    });
  });
});
