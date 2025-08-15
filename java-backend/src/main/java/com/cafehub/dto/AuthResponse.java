package com.cafehub.dto;

import com.cafehub.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String message;
    private String token;
    private UserDto user;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private User.Role role;
        private String phone;
        private String avatar;
        
        public static UserDto fromUser(User user) {
            return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone(),
                user.getAvatar()
            );
        }
    }
}