INSERT INTO
    UserRole (user_id, role_name)
SELECT u.user_id, 'user'
FROM User u
    LEFT JOIN UserRole ur ON u.user_id = ur.user_id
WHERE
    ur.user_id IS NULL;