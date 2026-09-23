CREATE DATABASE [HomeLibrary];
GO

USE [HomeLibrary];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE TABLE [dbo].[Books] (
    [Id] NVARCHAR(36) PRIMARY KEY NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Author] NVARCHAR(255) NOT NULL,
    [PublishingYear] NVARCHAR(4) NOT NULL,
    [TableOfContents] XML NULL,
    [Notes] NVARCHAR(MAX) NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    INDEX [IX_Books_IsDeleted] NONCLUSTERED ([IsDeleted])
);
GO

CREATE PRIMARY XML INDEX IX_Books_TableOfContents 
ON Books(TableOfContents);

CREATE XML INDEX IX_Books_TableOfContents_Value 
ON Books(TableOfContents) 
USING XML INDEX IX_Books_TableOfContents 
FOR VALUE;
GO

CREATE OR ALTER PROCEDURE [dbo].[InsertBook]
    @Id NVARCHAR(36),
    @Title NVARCHAR(255),
    @Author NVARCHAR(255),
    @PublishingYear NVARCHAR(4),
    @TableOfContents XML,
    @Notes NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Books (Id, Title, Author, PublishingYear, TableOfContents, Notes, CreatedAt, UpdatedAt, IsDeleted)
            VALUES (@Id, @Title, @Author, @PublishingYear, @TableOfContents, @Notes, @CreatedAt, @UpdatedAt, 0)

END
GO

CREATE OR ALTER PROCEDURE [dbo].[GetBook]
    @Id NVARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM Books WHERE Id = @Id AND IsDeleted = 0

END
GO

CREATE OR ALTER PROCEDURE [dbo].[GetAllBooks]
    @Offset INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM Books WHERE IsDeleted = 0
    ORDER BY UpdatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
END
GO

CREATE OR ALTER PROCEDURE [dbo].[UpdateBook]
    @Id NVARCHAR(36),
    @Title NVARCHAR(255),
    @Author NVARCHAR(255),
    @PublishingYear NVARCHAR(4),
    @TableOfContents XML,
    @Notes NVARCHAR(MAX),
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Books 
            SET Title = @Title, 
                Author = @Author, 
                PublishingYear = @PublishingYear, 
                TableOfContents = @TableOfContents, 
                Notes = @Notes, 
                UpdatedAt = @UpdatedAt 
            WHERE Id = @Id

END
GO

CREATE OR ALTER PROCEDURE [dbo].[DeleteBook]
    @Id NVARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Books SET IsDeleted = 1 WHERE Id = @Id

END
GO

CREATE OR ALTER PROCEDURE [dbo].[SearchBooks]
    @Query NVARCHAR(50),
    @Offset INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;


    SELECT * FROM Books 
        WHERE IsDeleted = 0 
          AND (
              Title LIKE '%' + @Query + '%'
              OR Author LIKE '%' + @Query + '%'
               OR TableOfContents.exist('/TableOfContents/Chapter[contains(@Title, sql:variable("@Query"))]') = 1
               OR TableOfContents.exist('/TableOfContents/Chapter[Title = sql:variable("@Query")]') = 1
          )
        ORDER BY UpdatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY

END
GO

INSERT INTO [dbo].[Books] ([Id], [Title], [Author], [PublishingYear], [TableOfContents], [Notes])
VALUES 
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    N'Мастер и Маргарита',
    N'Михаил Булгаков',
    N'1967',
    N'<TableOfContents>
        <Chapter Number="1" Title="Пролог" />
        <Chapter Number="2" Title="Никольская улица" />
        <Chapter Number="3" Title="Понедельник в день святых бессребреников и целителей Космы и Дамиана" />
        <Chapter Number="4" Title="Понедельник. Вечер" />
        <Chapter Number="5" Title="Свидание" />
        <Chapter Number="6" Title="Погребение" />
    </TableOfContents>',
    N'Сатирический роман, написанный в 1928–1940 годах. Один из самых сложных и загадочных романов русской литературы XX века.'
),
(
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    N'Дюна',
    N'Фрэнк Герберт',
    N'1965',
    N'<TableOfContents>
        <Part Name="Часть первая">
            <Chapter Number="1" Title="Дюна" />
            <Chapter Number="2" Title="Гайя" />
            <Chapter Number="3" Title="Лето" />
        </Part>
        <Part Name="Часть вторая">
            <Chapter Number="4" Title="Братство" />
            <Chapter Number="5" Title="Монашеский орден" />
        </Part>
    </TableOfContents>',
    N'Научно-фантастический роман, ставший классикой жанра. Действие происходит в далёком будущем, главным объектом которого является пустынная планета Арракис.'
),
(
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    N'Чистый код. Создание, анализ и рефакторинг',
    N'Роберт Мартин',
    N'2008',
    N'<TableOfContents>
        <Chapter Number="1" Title="Чистый код" />
        <Chapter Number="2" Title="Значимые имена" />
        <Chapter Number="3" Title="Функции" />
        <Chapter Number="4" Title="Комментарии" />
        <Chapter Number="5" Title="Форматирование" />
    </TableOfContents>',
    N'Книга о принципах создания качественного программного обеспечения. Обязательна к прочтению для разработчиков.'
),
(
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    N'Евгений Онегин',
    N'Александр Пушкин',
    N'1833',
    N'<TableOfContents>
        <Chapter Number="Глава первая" Title="Посвящение" />
        <Chapter Number="Глава первая" Title="Станционный смотритель" />
        <Chapter Number="Глава вторая" Title="Вступление" />
        <Chapter Number="Глава шестая" Title="Письмо Татьяны" />
    </TableOfContents>',
    N'Роман в стихах, описывающий жизнь русского дворянина Евгения Онегина. Энциклопедия русской жизни.'
),
(
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    N'Sapiens: Краткая история человечества',
    N'Юваль Ной Харари',
    N'2011',
    N'<TableOfContents>
        <Part Name="Часть I. Революция познания">
            <Chapter Number="1" Title="Революция познания" />
        </Part>
        <Part Name="Часть II. Дерево познания">
            <Chapter Number="2" Title="Дерево познания" />
        </Part>
        <Part Name="Часть III. У истоков культуры">
            <Chapter Number="3" Title="У истоков культуры" />
        </Part>
    </TableOfContents>',
    N'Книга описывает эволюцию человечества от каменного века до эпохи искусственного интеллекта.'
);

PRINT 'HomeLibrary database initialized successfully.';
GO
