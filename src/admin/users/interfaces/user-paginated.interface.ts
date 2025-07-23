import { UserResponseDto } from '../dto/user-response.dto';

export interface UserPaginatedResponse {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
