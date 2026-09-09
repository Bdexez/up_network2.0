import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { CompanyId } from 'src/common/decorators/current-user.decorator';
import { SearchPaginationDto } from 'src/common/pagination/search-pagination.dto';
import { PartnersService } from './partners.service';
import { ContactsService } from './contacts.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@ApiTags('crm')
@ApiBearerAuth()
@Controller('partners')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly contactsService: ContactsService,
  ) {}

  @Post()
  @RequirePermission('crm', 'partners', 'create')
  create(@CompanyId() companyId: number, @Body() dto: CreatePartnerDto) {
    return this.partnersService.create(companyId, dto);
  }

  @Get()
  @RequirePermission('crm', 'partners', 'read')
  findAll(@CompanyId() companyId: number, @Query() query: SearchPaginationDto) {
    return this.partnersService.findAll(companyId, query);
  }

  /** Liste allégée et complète, destinée aux sélecteurs de formulaire. */
  @Get('options')
  @RequirePermission('crm', 'partners', 'read')
  findOptions(
    @CompanyId() companyId: number,
    @Query('type') type?: 'CUSTOMER' | 'SUPPLIER',
  ) {
    return this.partnersService.findOptions(companyId, type);
  }

  @Get(':id')
  @RequirePermission('crm', 'partners', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.partnersService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('crm', 'partners', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('crm', 'partners', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.partnersService.remove(companyId, id);
  }

  // --- Contacts rattachés au tiers ------------------------------------------

  @Get(':id/contacts')
  @RequirePermission('crm', 'partners', 'read')
  findContacts(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.contactsService.findAll(companyId, id);
  }

  @Post(':id/contacts')
  @RequirePermission('crm', 'partners', 'update')
  createContact(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(companyId, id, dto);
  }

  @Patch(':id/contacts/:contactId')
  @RequirePermission('crm', 'partners', 'update')
  updateContact(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(companyId, id, contactId, dto);
  }

  @Delete(':id/contacts/:contactId')
  @RequirePermission('crm', 'partners', 'update')
  removeContact(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    return this.contactsService.remove(companyId, id, contactId);
  }
}
