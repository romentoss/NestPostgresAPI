import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { Auth } from '../auth/decorators';


@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}


  @Get()
  @Auth(ValidRoles.admin)
  executedSeed() {
    return this.seedService.runSeed();
  }

  
 
}
