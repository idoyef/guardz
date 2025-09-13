import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Entry } from '../src/entries/entities/entry.entity';
import { CustomField } from '../src/entries/entities/custom-field.entity';
import { Repository } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let entryRepository: Repository<Entry>;
  let customFieldRepository: Repository<CustomField>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    entryRepository = moduleFixture.get<Repository<Entry>>(
      getRepositoryToken(Entry),
    );
    customFieldRepository = moduleFixture.get<Repository<CustomField>>(
      getRepositoryToken(CustomField),
    );

    await app.init();
  });

  afterEach(async () => {
    await customFieldRepository.clear();
    await entryRepository.clear();
    await app.close();
  });

  describe('/entries (POST)', () => {
    it('should create a new entry', () => {
      const createEntryDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        message: 'Test message',
      };

      return request(app.getHttpServer())
        .post('/entries')
        .send(createEntryDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe(createEntryDto.name);
          expect(res.body.email).toBe(createEntryDto.email);
          expect(res.body.phone).toBe(createEntryDto.phone);
          expect(res.body.message).toBe(createEntryDto.message);
          expect(res.body.id).toBeDefined();
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
        });
    });

    it('should create a new entry with custom fields', async () => {
      const createEntryDto = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '987654321',
        message: 'Test message with custom fields',
        customFields: [
          { key: 'company', value: 'Acme Corp' },
          { key: 'department', value: 'Engineering' },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/entries')
        .send(createEntryDto)
        .expect(201);

      expect(response.body.name).toBe(createEntryDto.name);
      expect(response.body.email).toBe(createEntryDto.email);
      expect(response.body.id).toBeDefined();

      const customFields = await customFieldRepository.find({
        where: { entryId: response.body.id },
      });
      expect(customFields).toHaveLength(2);
      expect(customFields[0].key).toBe('company');
      expect(customFields[0].value).toBe('Acme Corp');
      expect(customFields[1].key).toBe('department');
      expect(customFields[1].value).toBe('Engineering');
    });

    it('should create a new entry with single custom field', async () => {
      const createEntryDto = {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        message: 'Test message with single custom field',
        customFields: [{ key: 'role', value: 'Developer' }],
      };

      const response = await request(app.getHttpServer())
        .post('/entries')
        .send(createEntryDto)
        .expect(201);

      expect(response.body.name).toBe(createEntryDto.name);
      expect(response.body.email).toBe(createEntryDto.email);

      const customFields = await customFieldRepository.find({
        where: { entryId: response.body.id },
      });
      expect(customFields).toHaveLength(1);
      expect(customFields[0].key).toBe('role');
      expect(customFields[0].value).toBe('Developer');
    });

    it('should create a new entry with empty custom fields array', async () => {
      const createEntryDto = {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        message: 'Test message with empty custom fields',
        customFields: [],
      };

      const response = await request(app.getHttpServer())
        .post('/entries')
        .send(createEntryDto)
        .expect(201);

      expect(response.body.name).toBe(createEntryDto.name);
      expect(response.body.email).toBe(createEntryDto.email);

      const customFields = await customFieldRepository.find({
        where: { entryId: response.body.id },
      });
      expect(customFields).toHaveLength(0);
    });

    it('should return 400 for invalid custom field data', () => {
      const invalidDto = {
        name: 'Test User',
        email: 'test@example.com',
        customFields: [{ key: '', value: 'Valid Value' }],
      };

      return request(app.getHttpServer())
        .post('/entries')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for custom field with missing required fields', () => {
      const invalidDto = {
        name: 'Test User',
        email: 'test@example.com',
        customFields: [{ key: 'company' }],
      };

      return request(app.getHttpServer())
        .post('/entries')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for custom field with too long key', () => {
      const invalidDto = {
        name: 'Test User',
        email: 'test@example.com',
        customFields: [{ key: 'a'.repeat(51), value: 'Valid Value' }],
      };

      return request(app.getHttpServer())
        .post('/entries')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for custom field with too long value', () => {
      const invalidDto = {
        name: 'Test User',
        email: 'test@example.com',
        customFields: [{ key: 'company', value: 'a'.repeat(101) }],
      };

      return request(app.getHttpServer())
        .post('/entries')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for invalid data', () => {
      const invalidDto = {
        name: '',
        email: 'invalid-email',
      };

      return request(app.getHttpServer())
        .post('/entries')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/entries (GET)', () => {
    it('should return all entries', async () => {
      const entry1 = entryRepository.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        message: 'Test message 1',
      });

      const entry2 = entryRepository.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '987654321',
        message: 'Test message 2',
      });

      await entryRepository.save([entry1, entry2]);

      return request(app.getHttpServer())
        .get('/entries')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].name).toBeDefined();
          expect(res.body[0].email).toBeDefined();
        });
    });

    it('should return entries with custom fields', async () => {
      const entry1 = entryRepository.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        message: 'Test message 1',
      });

      const entry2 = entryRepository.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '987654321',
        message: 'Test message 2',
      });

      const savedEntries = await entryRepository.save([entry1, entry2]);

      const customField1 = customFieldRepository.create({
        key: 'company',
        value: 'Acme Corp',
        entryId: savedEntries[0].id,
      });

      const customField2 = customFieldRepository.create({
        key: 'department',
        value: 'Engineering',
        entryId: savedEntries[0].id,
      });

      await customFieldRepository.save([customField1, customField2]);

      return request(app.getHttpServer())
        .get('/entries')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);

          const entryWithCustomFields = res.body.find(
            (entry: Entry) => entry.id === savedEntries[0].id,
          );
          const entryWithoutCustomFields = res.body.find(
            (entry: Entry) => entry.id === savedEntries[1].id,
          );

          expect(entryWithCustomFields.customFields).toHaveLength(2);
          expect(entryWithCustomFields.customFields[0].key).toBe('company');
          expect(entryWithCustomFields.customFields[0].value).toBe('Acme Corp');
          expect(entryWithCustomFields.customFields[1].key).toBe('department');
          expect(entryWithCustomFields.customFields[1].value).toBe(
            'Engineering',
          );

          expect(entryWithoutCustomFields.customFields).toHaveLength(0);
        });
    });

    it('should return empty array when no entries exist', () => {
      return request(app.getHttpServer())
        .get('/entries')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
        });
    });
  });
});
