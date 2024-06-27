package com.IpTutor.Backend.service;

import com.IpTutor.Backend.dto.GameDTO;
import com.IpTutor.Backend.dto.GameRequestDTO;
import com.IpTutor.Backend.model.Game;
import com.IpTutor.Backend.repository.GameRepository;
import com.mongodb.client.result.DeleteResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository gameRepository;
    private final MongoTemplate mongoTemplate;

    public GameDTO createGame(GameRequestDTO gameRequestDTO) {
        Game game = Game.builder()
                .gameName(gameRequestDTO.gameName())
                .highScore(gameRequestDTO.highScore())
                .build();

        game.setId(new ObjectId());

        gameRepository.save(game);
        log.info("Game Info Successfully Saved");
        return new GameDTO(game.getGameName(), game.getHighScore());
    }

    public String deleteGame(String gameName) {
        Query findGame = new Query(Criteria.where("gameName").is(gameName));
        DeleteResult deleteResult = mongoTemplate.remove(findGame, Game.class);

        return "Game Deletion: " + deleteResult;
    }
}
